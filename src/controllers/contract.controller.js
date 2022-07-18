/* eslint-disable security/detect-non-literal-require */
const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { contractService, syncDataService } = require('../services');
const pick = require('../utils/pick');
const { throwException } = require('../config/exception');

const updateConfirmData = catchAsync(async (req, res) => {
  const { data } = pick(req.query, ['data']);
  const result = await syncDataService.updateConfirmData(data);
  res.send(result);
});

const dynamicCallContract = catchAsync(async (req, res) => {
  const { abi, address, method, params } = req.body;
  const nftAbi = require(`../utils/contract/${abi}`);
  if (!nftAbi.abi) throwException(httpStatus.NOT_FOUND, 'Abi is not validated!');

  const result = await contractService.dynamicCallContract(nftAbi.abi, address, method, params);
  res.send(result);
});

const dynamicSendContract = catchAsync(async (req, res) => {
  const { signedData } = req.body;
  const result = await contractService.dynamicSendContract(signedData);
  res.send(result);
});

module.exports = {
  updateConfirmData,
  dynamicCallContract,
  dynamicSendContract,
};
