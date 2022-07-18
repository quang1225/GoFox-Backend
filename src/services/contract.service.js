const { loadContract } = require('../utils/web3');

let web3;

const dynamicCallContract = async (abi, address, method, params) => {
  const _instantContracts = await loadContract(abi, address);
  const result = await _instantContracts.methods[method](...params).call();
  return result;
};

const isNftOwner = async ({ tokenId, collectionAddress, walletAddress }) => {
  const nftAbi = require('../utils/contract/NFTCollection.json');
  const result = await dynamicCallContract(nftAbi.abi, collectionAddress, 'ownerOf', [tokenId]);

  return !!result && result.toLowerCase() === walletAddress;
};

const dynamicSendContract = async (data) => {
  const result = await web3.eth.sendSignedTransaction(data);
  return result;
};

module.exports = {
  dynamicCallContract,
  dynamicSendContract,
  isNftOwner,
};
