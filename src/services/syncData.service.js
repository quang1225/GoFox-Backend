const { convertToWei, initGlobalWeb3Static, loadMarketContract, loadRewardContract } = require('../utils/web3');
const { itemListingService, itemService, itemOwnerService, rewardService } = require('.');
const { ItemListing, ItemActivity, ItemOwner } = require('../models');
const logger = require('../config/logger');
const { getNextHoursTime } = require('../utils/datetimeExtension');
const { Sort, ItemActivityTypes, DefaultStatus, ListingStatus } = require('../utils/constants');
const { logException } = require('../config/exception');

let web3;

const isClaimReward = async (data) => {
  return data && data.status && Number(data.reciept) > 0;
};

const isListingOwner = async (data, listing) => {
  return (
    data &&
    Number(data.id) > 0 &&
    data.seller.toLowerCase() === listing.ownerAddress &&
    data.priceAsset === (await convertToWei(listing.price))
  );
};

const getTokenId = async (data) => {
  return web3 && web3.utils.hexToNumber(data.logs[0].topics[3]);
};

const verifyListings = async () => {
  const _itemActivities = await itemListingService.queryItemUnconfirmListing();
  logger.info(`LISTINGS VERIFY - Found ${_itemActivities.length} need verify`);

  const _contractMartket = await loadMarketContract();
  _itemActivities.forEach(async (activity) => {
    const _listing = await ItemListing.findOne({
      itemId: activity.itemId,
      owner: activity.owner,
      tokenId: activity.tokenId,
      price: activity.price,
    }).sort({ createdAt: Sort.ASCENDING });

    let result = false;
    try {
      if (!_listing || !_listing.tokenId) {
        return;
      }

      const _collectionToken = _listing.collectionAddress;
      const _tokenId = _listing.tokenId;
      const _ownerAddress = activity.ownerAddress;

      // First cancel to disable transferable, this just re-active activities
      if (_listing.status === ListingStatus.CANCEL) {
        await itemListingService.updateItemListingStatus(_listing, ListingStatus.CANCEL);
        return;
      }

      // Not in case cancel mean in case listings
      const _data = await _contractMartket.methods.orderByAssetId(_collectionToken, _tokenId, _ownerAddress).call();
      if (await isListingOwner(_data, _listing)) {
        await itemListingService.updateItemListingStatus(_listing, ListingStatus.ACTIVE);
        result = true;
      }
    } catch (error) {
      logException(`LISTINGS VERIFY - ${error}`);
    } finally {
      if (!result && !!_listing && activity.updatedAt <= getNextHoursTime(-6)) {
        // Update status OTHER (2) mean looped, need manual process
        await itemListingService.updateItemListingById(_listing._id, { status: DefaultStatus.OTHER });
        await ItemActivity.updateOne({ _id: activity._id }, { $set: { status: DefaultStatus.OTHER } });
      }
    }
  });
};

const verifyMints = async () => {
  const _items = await itemService.queryItemsWithUserOwners(DefaultStatus.DEACTIVE);
  logger.info(`MINT VERIFY - Found ${_items.length} need verify`);
  _items.forEach(async (item) => {
    // No transactionId mean not click confirm yet
    if (!item.transactionId) {
      return;
    }

    let result = false;
    try {
      const _itemId = item._id;
      const _owner = item.creator;
      const transactionId = item.transactionId;

      const _data = await web3.eth.getTransactionReceipt(transactionId);
      if (_data && _data.status) {
        // Get tokenId from Receipt
        const tokenId = await getTokenId(_data);

        // Add tokenId to owner
        const _itemOwner = await ItemOwner.findOne({ itemId: _itemId, owner: _owner });
        // Exist => update
        if (_itemOwner) {
          _itemOwner.tokenIds.push(tokenId);
          _itemOwner.tokenIds = [...new Set(_itemOwner.tokenIds)];
          await _itemOwner.save();
        } else {
          // Not exist => created
          await ItemOwner.create({
            owner: _owner,
            itemId: _itemId,
            tokenIds: [tokenId],
            supply: 1,
          });
        }

        // Update status of item
        await itemService.updateItemById(_itemId, { status: DefaultStatus.ACTIVE });
        result = true;
      }
    } catch (error) {
      logException(`MINT VERIFY - ${error}`);
    } finally {
      if (!result && item.updatedAt <= getNextHoursTime(-6)) {
        // Update status OTHER (2) mean looped, need manual process
        await itemService.updateItemById(item._id, { status: DefaultStatus.OTHER });
      }
    }
  });
};

const verifyTransfers = async () => {
  const _activities = await ItemActivity.find({ status: DefaultStatus.DEACTIVE, historyType: ItemActivityTypes.TRANSFER });
  logger.info(`TRANSFER VERIFY - Found ${_activities.length} need verify`);

  _activities.forEach(async (activity) => {
    let result = false;
    try {
      const transactionId = activity.transactionId;
      const status = DefaultStatus.ACTIVE;

      const _data = await web3.eth.getTransactionReceipt(transactionId);
      if (_data && _data.status) {
        await itemOwnerService.confirmTransferItem({ transactionId, status });
        result = true;
      }
    } catch (error) {
      logException(`TRANSFER VERIFY - ${error}`);
    } finally {
      if (!result && activity.updatedAt <= getNextHoursTime(-6)) {
        activity.status = DefaultStatus.OTHER;
        await activity.save();
      }
    }
  });
};

const verifyRewards = async () => {
  const _contractReward = await loadRewardContract();
  const _rewards = await rewardService.getUnconfirmReward();
  logger.info(`REWARD VERIFY - Found ${_rewards.length} need verify`);

  _rewards.forEach(async (reward) => {
    let result = false;
    try {
      const _transactionId = reward.transactionId;
      const _userId = reward.userId;
      const _data = await _contractReward.methods.processReward(_transactionId).call();
      // Exist mean claimed reward
      if (await isClaimReward(_data)) {
        // get userId by address _reciept
        await rewardService.claimReward(_transactionId, _userId);
        result = true;
      }
    } catch (error) {
      logException(`REWARD VERIFY - ${error}`);
    } finally {
      if (!result && reward.updatedAt <= getNextHoursTime(-6)) {
        reward.status = DefaultStatus.OTHER;
        await reward.save();
      }
    }
  });
};

const updateConfirmData = async (source) => {
  web3 = await initGlobalWeb3Static();

  // Update item, owner in uncompleted mint
  if (source.includes('items')) {
    await verifyMints();
  }

  // Update owner in uncompleted transfer
  if (source.includes('owners')) {
    await verifyTransfers();
  }

  // Update uncompleted listings
  if (source.includes('listings')) {
    await verifyListings();
  }

  // Update uncompleted request reward
  if (source.includes('rewards')) {
    await verifyRewards();
  }

  return true;
};

module.exports = { updateConfirmData };
