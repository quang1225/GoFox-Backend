const catchAsync = require('../utils/catchAsync');
const { airdropService } = require('../services');

const validateAirDrop = catchAsync(async (req, res) => {
  const { walletAddress } = req.params;
  const _airdrop = await airdropService.validateAirDrop(walletAddress);
  res.send(_airdrop);
});

const updateClaimAirDropFilter = catchAsync(async (req, res) => {
  const { walletAddress } = req.params;
  const _airdrop = await airdropService.updateAirDropFilter(walletAddress, 1);
  res.send(_airdrop);
});

const distributeAirDrop = catchAsync(async (req, res) => {
  const _airdrop = await airdropService.distributeAirDrop();
  res.send(_airdrop);
});

const generateSignature = catchAsync(async (req, res) => {
  const { reciept, amount } = req.body;
  const result = await airdropService.generateSignature(reciept, amount);
  res.send(result);
});

module.exports = {
  validateAirDrop,
  updateClaimAirDropFilter,
  distributeAirDrop,
  generateSignature,
};
