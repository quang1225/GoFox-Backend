const Web3 = require('web3');
const nftAbi = require('./contract/NFTCollection.json');
const marketAbi = require('./contract/NFTMarketplace.json');
const tokenAbi = require('./contract/Token.json');
const rewardAbi = require('./contract/Reward.json');
const config = require('../config/config');
const { NetWork } = require('./constants');

let globalWeb3;

// Use temp this because cannot export module varible
const convertToWei = async (number, unit) => {
  return globalWeb3.utils.toWei(number.toString(), unit);
};

const initGlobalWeb3Static = async (chainId = NetWork.ETH) => {
  // we are in the server side and metmask is not available
  const networks = {
    ETH: config.network.eth,
    BSC: config.network.bsc,
  };

  globalWeb3 = new Web3(new Web3.providers.HttpProvider(networks[chainId] || config.network.eth));
  return globalWeb3;
};
const loadContract = async (abi, address, chainId = NetWork.ETH) => {
  await initGlobalWeb3Static(chainId);
  const _instantContracts = new globalWeb3.eth.Contract(abi, address);
  return _instantContracts;
};
const loadDefaultNftContract = async () => {
  return loadContract(nftAbi.abi, config.network.nftAddress);
};

const loadMarketContract = async () => {
  return loadContract(marketAbi.abi, config.network.marketAddress);
};

const loadTokenContract = async () => {
  return loadContract(tokenAbi.abi, config.network.tokenAddress, NetWork.BSC);
};

const loadRewardContract = async () => {
  return loadContract(rewardAbi.abi, config.network.rewardAddress, NetWork.BSC);
};

module.exports = {
  convertToWei,
  initGlobalWeb3Static,
  loadContract,
  loadDefaultNftContract,
  loadMarketContract,
  loadTokenContract,
  loadRewardContract,
};
