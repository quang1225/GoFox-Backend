const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { rewardService } = require('../services');
const { throwException } = require('../config/exception');

const claimReward = catchAsync(async (req, res) => {
  const { transactionId, userId } = req.body;

  const _claim = await rewardService.claimReward(transactionId, userId);
  if (!_claim) {
    throwException(httpStatus.INTERNAL_SERVER_ERROR, 'Claim error');
  }

  const { amount } = _claim;
  res.send({
    isClaimed: !!_claim,
    userId,
    amount,
  });
});

const generateSignature = catchAsync(async (req, res) => {
  const { userId } = req.body;
  const result = await rewardService.generateSignature(userId);
  res.send(result);
});

const getReward = catchAsync(async (req, res) => {
  const { userId } = req.query;
  const result = await rewardService.getReward(userId);
  res.send(result);
});

module.exports = {
  getReward,
  claimReward,
  generateSignature,
};
