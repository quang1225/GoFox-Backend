const httpStatus = require('http-status');
const { AirDrop } = require('../models');
const { initGlobalWeb3Static } = require('../utils/web3');
const config = require('../config/config');
const { throwException } = require('../config/exception');

const createAirDrop = async (airdropBody) => {
  const _airdrop = await AirDrop.create(airdropBody);
  return _airdrop;
};

const queryAirDrops = async (filter, options) => {
  const _airdrops = await AirDrop.paginate(filter, options);
  return _airdrops;
};

const getAirDropById = async (id) => {
  return AirDrop.findById(id);
};

const validateAirDrop = async (walletAddress) => {
  const _airdrop = await AirDrop.getAirDrop(walletAddress);
  if (!_airdrop) {
    throwException(httpStatus.NOT_FOUND, 'AirDrop not found');
  }

  const { updatedAt, amount, status } = _airdrop;
  return {
    isClaimed: status !== 0,
    walletAddress,
    updatedAt,
    amount,
  };
};

const updateAirDropById = async (airdropId, updateBody) => {
  const _airdrop = await getAirDropById(airdropId);
  if (!_airdrop) {
    throwException(httpStatus.NOT_FOUND, 'AirDrop not found');
  }
  Object.assign(_airdrop, updateBody);
  await _airdrop.save();
  return _airdrop;
};

const updateAirDropFilter = async (walletAddress, status) => {
  const _airdrop = await AirDrop.getAirDrop(walletAddress);
  if (!_airdrop) {
    throwException(httpStatus.NOT_FOUND, 'AirDrop not found');
  }
  Object.assign(_airdrop, { status, amount: 5 });
  await _airdrop.save();
  const { updatedAt, amount } = _airdrop;
  return {
    isClaimed: status !== 0,
    walletAddress,
    updatedAt,
    amount,
  };
};

const deleteAirDropById = async (airdropId) => {
  const _airdrop = await getAirDropById(airdropId);
  if (!_airdrop) {
    throwException(httpStatus.NOT_FOUND, 'AirDrop not found');
  }
  await _airdrop.remove();
  return _airdrop;
};

const getAirDrops = async (status, limit = 10) => {
  const _airdrops = await AirDrop.find({ status }).limit(limit);
  return _airdrops;
};

const distributeAirDrop = async () => {
  //   const web3 = await initGlobalWeb3Static('BSC');
  //   const _contract = await loadTokenContract();

  //   return true;
  throw new Error('Service is not support');
};

const generateSignature = async (reciept, airdropAmount) => {
  const _airdrop = await AirDrop.getAirDrop(reciept);
  if (!_airdrop) {
    throwException(httpStatus.NOT_FOUND, 'AirDrop is not valid');
  }
  if (airdropAmount !== 5) throwException(httpStatus.BAD_REQUEST, 'Amount is not validated!');

  const privateKey = config.network.privateKeyDistributeAddress;

  const web3 = await initGlobalWeb3Static();
  const amount = web3.utils.toWei(airdropAmount.toString(), 'ether');
  const message = web3.utils.soliditySha3({ t: 'address', v: reciept }, { t: 'uint256', v: amount }).toString('hex');
  const { signature } = web3.eth.accounts.sign(message, privateKey);
  return signature;
};

module.exports = {
  createAirDrop,
  queryAirDrops,
  getAirDropById,
  updateAirDropById,
  deleteAirDropById,
  validateAirDrop,
  updateAirDropFilter,
  distributeAirDrop,
  getAirDrops,
  generateSignature,
};
