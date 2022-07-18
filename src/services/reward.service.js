const httpStatus = require('http-status');
const mongoose = require('mongoose');
const { Reward, User, RewardRequest } = require('../models');
const config = require('../config/config');
const { initGlobalWeb3Static } = require('../utils/web3');
const { sessionRetryWrite } = require('../utils/sessionExtension');
const { DefaultStatus, Sort } = require('../utils/constants');
const { logException, throwException } = require('../config/exception');

const getReward = async (userId) => {
  const _reward = await Reward.aggregate([
    {
      $project: {
        _id: 0,
        r: '$$ROOT',
      },
    },
    { $match: { 'r.userId': mongoose.Types.ObjectId(userId) } },
    {
      $lookup: {
        localField: 'r.userId',
        from: 'rewardrequests',
        foreignField: 'userId',
        as: 'p',
      },
    },
    {
      $unwind: {
        path: '$p',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $sort: {
        createdAt: Sort.DESCENDING,
      },
    },
    {
      $project: {
        claimableToken: '$r.claimableToken',
        totalClaim: '$r.totalClaim',
        activities: '$r.activities',
        userId: '$r.userId',
        createdAt: '$r.createdAt',
        lastRequest: '$p',
      },
    },
  ]);

  return _reward[0] || {};
};

const getUnconfirmReward = async () => {
  const _reward = await RewardRequest.find({ status: DefaultStatus.DEACTIVE });
  return _reward;
};

const createReward = async (rewardBody, session) => {
  const _reward = await Reward.create([rewardBody], { session });
  return _reward[0];
};

const addReward = async (userId, price, activity, session) => {
  try {
    const amount = Number(price.toFixed(4));
    const _reward = await Reward.getReward(userId);
    if (!_reward) {
      const _newReward = {
        activities: [{ activity, amount, dateTime: Date.now() }],
        userId,
        claimableToken: amount,
      };
      await createReward(_newReward, session);
      return true;
    }

    _reward.activities.push({ activity, amount, dateTime: Date.now() });
    _reward.claimableToken += amount;
    await _reward.save({ session });
    return true;
  } catch (error) {
    logException(error);
    return false;
  }
};

const claimReward = async (transactionId, userId) => {
  const _reward = await Reward.findOne({ userId, claimableToken: { $gt: 0 } });
  if (!_reward) {
    throwException(httpStatus.BAD_REQUEST, 'Reward is invalid to claim');
  }

  return sessionRetryWrite(async (session) => {
    const _rewardRequest = await RewardRequest.findOne({ userId, transactionId, status: DefaultStatus.DEACTIVE });
    if (!_rewardRequest) {
      throwException(httpStatus.BAD_REQUEST, 'Reward is invalid');
    }
    _rewardRequest.status = 1;
    await _rewardRequest.save({ session });

    // Update Reward claim
    const { claimableToken } = _reward;
    _reward.totalClaim += _reward.claimableToken;
    _reward.claimableToken -= claimableToken;
    const result = await _reward.save({ session });
    return !!result && !result.errors && result;
  });
};

const generateSignature = async (userId) => {
  const _reward = await Reward.findOne({ userId, claimableToken: { $gt: 0 } }).sort({ createdAt: Sort.ASCENDING });
  if (!_reward) {
    throwException(httpStatus.BAD_REQUEST, 'Reward is invalid');
  }

  // Check is request claim reward in past day
  const web3 = await initGlobalWeb3Static();
  const transactionId = web3.utils.randomHex(32);

  const lastDay = new Date();
  lastDay.setDate(lastDay.getDate() - 1);
  let _rewardRequest = await RewardRequest.findOne({ userId, createdAt: { $gte: lastDay } });
  const { claimableToken } = _reward;
  if (!_rewardRequest) {
    _rewardRequest = await RewardRequest.create({
      transactionId,
      status: DefaultStatus.DEACTIVE,
      amount: claimableToken,
      userId,
    });
  }

  const { status } = _rewardRequest;
  if (status) {
    throwException(httpStatus.BAD_REQUEST, 'Reward is claimed within 24h');
  }

  const { walletAddress } = await User.findById(userId);

  const privateKey = config.network.privateKeyRewardAddress;

  const amount = web3.utils.toWei(claimableToken.toString(), 'ether');
  const message = web3.utils
    .soliditySha3(
      { t: 'string', v: _rewardRequest.transactionId },
      { t: 'address', v: walletAddress },
      { t: 'uint256', v: amount }
    )
    .toString('hex');
  const { signature } = web3.eth.accounts.sign(message, privateKey);

  return { signature, transactionId: _rewardRequest.transactionId };
};

module.exports = {
  getReward,
  createReward,
  addReward,
  claimReward,
  generateSignature,
  getUnconfirmReward,
};
