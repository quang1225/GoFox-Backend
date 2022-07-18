const httpStatus = require('http-status');
const mongoose = require('mongoose');
const { ItemOwner, ItemListing, ItemActivity, Collection, Item } = require('../models');
const { sessionRetryWrite } = require('../utils/sessionExtension');
const { arrayItemRemove, arrayItemAdd } = require('../utils/arrayExtension');
const { ItemActivityTypes, DefaultStatus, ListingStatus } = require('../utils/constants');
const { contractService, userService, itemListingService } = require('.');
const { throwException } = require('../config/exception');

const getTokenOwnerOrCreate = async ({ owner, itemId }) => {
  const _item = await ItemOwner.findOne({
    owner: owner._id,
    itemId: mongoose.Types.ObjectId(itemId),
  });

  if (_item) {
    return _item;
  }

  const _itemOwner = {
    tokenIds: [],
    owner,
    itemId,
    supply: 1,
  };
  return ItemOwner.create(_itemOwner);
};

const getTokenOwner = async ({ owner, itemId, tokenId }) => {
  const _item = await ItemOwner.findOne({
    owner: owner._id,
    itemId: mongoose.Types.ObjectId(itemId),
    $expr: { $in: [tokenId, '$tokenIds'] },
  });

  return !!_item && _item;
};

const createItemOwner = async (itemBody) => {
  const _itemOwner = await ItemOwner.create(itemBody);
  return _itemOwner;
};

const getItemOwnerById = async (id) => {
  return ItemOwner.findById(id);
};

const getOwnerItems = async (owner) => {
  const aggregate = await ItemOwner.aggregate([
    {
      $project: {
        _id: 0,
        o: '$$ROOT',
      },
    },
    {
      $lookup: {
        localField: 'o.itemId',
        from: 'items',
        foreignField: '_id',
        as: 'i',
      },
    },
    {
      $unwind: {
        path: '$i',
        preserveNullAndEmptyArrays: false,
      },
    },
    {
      $lookup: {
        localField: 'i.collectionId',
        from: 'collections',
        foreignField: '_id',
        as: 'coll',
      },
    },
    {
      $unwind: {
        path: '$coll',
        preserveNullAndEmptyArrays: false,
      },
    },
    { $match: { 'i.status': 1 } },
    {
      $lookup: {
        localField: 'o.owner',
        from: 'users',
        foreignField: '_id',
        as: 'u',
      },
    },
    {
      $unwind: {
        path: '$u',
        preserveNullAndEmptyArrays: false,
      },
    },
    { $match: { 'u.status': 1, 'u._id': mongoose.Types.ObjectId(owner) } },
    {
      $project: {
        'i.name': '$i.name',
        'i.slug': '$i.slug',
        'i.favorites': '$i.favorites',
        'i.avatar': '$i.avatar',
        'i.collectionId': '$i.collectionId',
        'i.status': '$i.status',
        'i._id': '$i._id',

        'coll.slug': '$coll.slug',
        'coll.name': '$coll.name',

        'u.fullname': '$u.fullname',
        'o.tokenIds': '$o.tokenIds',
        'u.avatar': '$u.avatar',
        'u.email': '$u.email',
        'u.walletAddress': '$u.walletAddress',
        'u._id': '$u._id',
        _id: 0,
      },
    },
    {
      $group: {
        _id: '$u',
        items: {
          $push: {
            _id: '$i._id',
            name: '$i.name',
            tokenIds: '$o.tokenIds',
            avatar: '$i.avatar',
            slug: '$i.slug',
            favorites: '$i.favorites',
            collectionSlug: '$coll.slug',
            collectionName: '$coll.name',
            collectionId: '$i.collectionId',
            status: '$i.status',
          },
        },
      },
    },
    {
      $project: {
        fullname: '$_id.fullname',
        email: '$_id.email',
        items: 1,
        _id: 0,
      },
    },
  ]);

  return aggregate[0] || [];
};

const updateItemOwnerById = async (itemOwnerId, updateBody) => {
  const _itemOwner = await getItemOwnerById(itemOwnerId);
  if (!_itemOwner) {
    throwException(httpStatus.NOT_FOUND, 'ItemOwner not found');
  }
  Object.assign(_itemOwner, updateBody);
  await _itemOwner.save();
  return _itemOwner;
};

const deleteItemOwnerById = async (itemOwnerId) => {
  const _itemOwner = await getItemOwnerById(itemOwnerId);
  if (!_itemOwner) {
    throwException(httpStatus.NOT_FOUND, 'ItemOwner not found');
  }
  await _itemOwner.remove();
  return _itemOwner;
};

const requestTransferItem = async (itemParams) => {
  const { collectionAddress, tokenId, owner, receiver, itemId, total, price, transactionId } = itemParams;

  if (owner === receiver) {
    throwException(httpStatus.INTERNAL_SERVER_ERROR, 'Cannot transfer item for your self');
  }

  if (await ItemActivity.findOne({ transactionId })) {
    throwException(httpStatus.INTERNAL_SERVER_ERROR, 'Transaction is processing');
  }

  // Update offsale listing state
  const _itemListing = await ItemListing.getItemListing({ tokenId, itemId, owner, price, status: DefaultStatus.ACTIVE });
  if (!_itemListing) {
    throwException(httpStatus.NOT_FOUND, 'Cannot found item listing');
  }

  if (_itemListing.expireAt && _itemListing.expireAt <= new Date()) {
    throwException(httpStatus.NOT_FOUND, 'Item lising is expired');
  }

  Object.assign(_itemListing, { status: ListingStatus.SALED });

  // Add collectionId for join trending
  const { collectionId } = (await Item.findById(itemId)) || {};

  return sessionRetryWrite(async (session) => {
    const _saveResult = await _itemListing.save({ session });
    if (!_saveResult || _saveResult.errors) {
      throwException(httpStatus.INTERNAL_SERVER_ERROR, 'Cannot offsale item listing');
    }

    // Add record to activity model
    const _activity = {
      historyType: ItemActivityTypes.TRANSFER,
      tokenId,
      itemId,
      price,
      fromUserId: owner,
      toUserId: receiver,
      status: DefaultStatus.DEACTIVE,
      transactionId,
      collectionAddress,
      collectionId,
      total,
    };
    await ItemActivity.create(_activity);
    return true;
  });
};

const confirmTransferItem = async (itemParams) => {
  const { transactionId, status } = itemParams;

  const _activity = await ItemActivity.findOne({ historyType: ItemActivityTypes.TRANSFER, transactionId });
  if (!_activity) {
    throwException(httpStatus.NOT_FOUND, 'Item ativity not found');
  }

  const itemId = _activity.itemId;
  const owner = _activity.fromUserId;
  const receiver = _activity.toUserId;
  const price = Number(_activity.price);
  // const gfxReward = Number(_activity.price) * 15000;
  const total = Number(_activity.total);

  const _itemOwner = await ItemOwner.getItemOwner(owner, itemId, total);
  if (!_itemOwner) {
    throwException(httpStatus.INTERNAL_SERVER_ERROR, 'Cannot transfer items');
  }

  return sessionRetryWrite(async (session) => {
    // Update owner supply
    const tokenId = _itemOwner.tokenIds.shift();
    await _itemOwner.save({ session });

    // If exist then update
    // Not exist then create
    const _itemReceiver = await ItemOwner.getItemOwner(receiver, itemId);
    if (_itemReceiver) {
      // Update receiver supply
      _itemReceiver.tokenIds.push(tokenId);
      await _itemReceiver.save({ session });
    } else {
      // Create owner for receiver
      await ItemOwner.create([{ tokenIds: [tokenId], itemId, owner: receiver, supply: total }], { session });
    }

    // Update offsale listing state if it still onsale after request transfer
    const _itemListing = await ItemListing.getItemListing({ itemId, owner, price, status: DefaultStatus.ACTIVE });
    if (_itemListing) {
      Object.assign(_itemListing, { status: DefaultStatus.OTHER });
      await _itemListing.save({ session });
    }

    // Incre activity count for join trending
    const { collectionId } = _activity;
    await Collection.findByIdAndUpdate(collectionId, { $inc: { countActivity: 1 } }, { session });

    // Update record to activity model
    _activity.status = status;
    await _activity.save({ session });

    // // Add reward
    // // Set reward for seller
    // if (!(await rewardService.addReward(owner, price, _activity._id, session))) {
    //   throwException(httpStatus.INTERNAL_SERVER_ERROR, 'Cannot add reward for seller');
    // }
    // // Set reward for buyer
    // if (!(await rewardService.addReward(receiver, price, _activity._id, session))) {
    //   throwException(httpStatus.INTERNAL_SERVER_ERROR, 'Cannot add reward for buyer');
    // }

    return true;
  });
};

const updateItemOwner = async (itemParams) => {
  const { collectionAddress, oldOwner, newOwner, itemId, tokenId, price } = itemParams;
  if (!(await contractService.isNftOwner({ tokenId, collectionAddress, walletAddress: newOwner }))) {
    throwException(httpStatus.BAD_REQUEST, 'Owner is not own NFT');
  }

  const _newOwner = await userService.getUserOrCreate(newOwner);
  if (!_newOwner) {
    throwException(httpStatus.INTERNAL_SERVER_ERROR, 'New user is have conflict');
  }

  const _oldOwner = await userService.getUserOrCreate(oldOwner);
  if (!_oldOwner) {
    throwException(httpStatus.INTERNAL_SERVER_ERROR, 'Old user is have conflict');
  }

  const oldOwnerToken = await getTokenOwner({ owner: _oldOwner, itemId, tokenId });
  if (!oldOwnerToken) {
    throwException(httpStatus.NOT_FOUND, 'Token of old owner not found');
  }

  const newOwnerToken = await getTokenOwnerOrCreate({ owner: _newOwner, itemId });
  if (!newOwnerToken) {
    throwException(httpStatus.INTERNAL_SERVER_ERROR, 'New owner conflict');
  }

  return sessionRetryWrite(async (session) => {
    const _isRemove = arrayItemRemove(oldOwnerToken.tokenIds, tokenId);
    const _saveOldOnwerResult = await oldOwnerToken.save({ session });
    if (!_isRemove || !_saveOldOnwerResult || _saveOldOnwerResult.errors) {
      throwException(httpStatus.INTERNAL_SERVER_ERROR, 'Cannot update tokenId for token Old owner');
    }

    const _idAdd = arrayItemAdd(newOwnerToken.tokenIds, tokenId);
    const _saveNewOwnerResult = await newOwnerToken.save({ session });
    if (!_idAdd || !_saveNewOwnerResult || _saveNewOwnerResult.errors) {
      throwException(httpStatus.INTERNAL_SERVER_ERROR, 'Cannot update tokenId for token New owner');
    }

    const _itemListing =
      price > 0 &&
      (await itemListingService.getItemListingByFilter(
        { tokenId, itemId, owner: _oldOwner._id, price },
        DefaultStatus.ACTIVE
      ));
    if (_itemListing) {
      _itemListing.status = ListingStatus.CANCEL;
      await _itemListing.save({ session });
    }

    return true;
  });
};

module.exports = {
  createItemOwner,
  getOwnerItems,
  getItemOwnerById,
  updateItemOwnerById,
  deleteItemOwnerById,
  requestTransferItem,
  confirmTransferItem,
  updateItemOwner,
};
