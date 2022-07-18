const httpStatus = require('http-status');
const mongoose = require('mongoose');
const { ItemListing, ItemActivity, ItemOwner } = require('../models');
const paginate = require('../utils/paginate');
const { DefaultStatus, Sort, ListingStatus } = require('../utils/constants');
const { ItemActivityTypes } = require('../utils/constants');
const { sessionRetryWrite } = require('../utils/sessionExtension');
const { throwException } = require('../config/exception');

const queryItemListings = async (filter, options) => {
  const _itemListings = await ItemListing.paginate(filter, options);
  return _itemListings;
};

const queryItemUnconfirmListing = async () => {
  const pipeline = [
    {
      $project: {
        _id: 0,
        a: '$$ROOT',
      },
    },
    {
      $match: {
        $and: [
          { 'a.status': DefaultStatus.DEACTIVE },
          { 'a.historyType': { $in: [ItemActivityTypes.LISTING, ItemActivityTypes.CANCEL] } },
        ],
      },
    },
    { $sort: { 'a.createdAt': Sort.DESCENDING } },
    {
      $lookup: {
        from: 'users',
        localField: 'a.fromUserId',
        foreignField: '_id',
        as: 'u',
      },
    },
    {
      $unwind: {
        path: '$u',
        preserveNullAndEmptyArrays: true,
      },
    },
    { $match: { 'u.status': 1 } },
    {
      $project: {
        _id: '$a._id',

        itemId: '$a.itemId',
        tokenId: '$a.tokenId',
        price: '$a.price',

        ownerAddress: '$u.walletAddress',
        owner: '$u._id',

        status: '$a.status',
        updatedAt: '$a.updatedAt',
      },
    },
  ];
  return (await ItemActivity.aggregate(pipeline)) || [];
};

const queryItemListingsWithDetails = async (filter, options) => {
  const { page, limit } = options;
  const { itemId, owner, status } = filter;

  const queryItemId = itemId ? { 'l.itemId': mongoose.Types.ObjectId(itemId) } : {};
  const queryOwner = owner ? { 'l.owner': mongoose.Types.ObjectId(owner) } : {};
  const queryStatus = status ? { 'l.status': status } : {};

  const pipeline = [
    {
      $project: {
        _id: 0,
        l: '$$ROOT',
      },
    },
    {
      $match: queryStatus,
    },

    {
      $lookup: {
        localField: 'l.itemId',
        from: 'items',
        foreignField: '_id',
        as: 'i',
      },
    },
    {
      $unwind: {
        path: '$i',
        preserveNullAndEmptyArrays: true,
      },
    },
    { $match: { 'i.status': 1, ...queryItemId } },
    {
      $lookup: {
        localField: 'l.owner',
        from: 'users',
        foreignField: '_id',
        as: 'o',
      },
    },
    {
      $unwind: {
        path: '$o',
        preserveNullAndEmptyArrays: true,
      },
    },
    { $match: { 'o.status': 1, ...queryOwner } },
    {
      $project: {
        _id: '$l._id',
        status: '$l.status',
        salePrice: '$l.salePrice',
        price: '$l.price',
        tokenId: '$l.tokenId',
        createdAt: '$l.createdAt',

        'owner._id': '$o._id',
        'owner.fullname': '$o.fullname',
        'owner.email': '$o.email',
        'owner.avatar': '$o.avatar',
        'owner.walletAddress': '$o.walletAddress',

        'item.name': '$i.name',
        'item.slug': '$i.slug',
        'item.collectionId': '$i.collectionId',
        'item.status': '$i.status',
      },
    },
  ].concat(paginate(page, limit));
  const aggregate = await ItemListing.aggregate(pipeline);

  return aggregate[0] || {};
};

const getItemListingById = async (id) => {
  return ItemListing.findById(id);
};

const getItemListingByFilter = async ({ tokenId, itemId, owner, price, expireAt }, status) => {
  return ItemListing.findOne({
    tokenId,
    itemId: mongoose.Types.ObjectId(itemId),
    owner: mongoose.Types.ObjectId(owner),
    status,
    price,
    expireAt,
  }).sort({ createdAt: Sort.DESCENDING });
};

const updateItemListingById = async (id, updateBody) => {
  const _itemListing = await getItemListingById(id);
  if (!_itemListing) {
    throwException(httpStatus.NOT_FOUND, 'Item Listing not found');
  }

  Object.assign(_itemListing, updateBody);
  await _itemListing.save();
  return _itemListing;
};

const createItemListing = async (itemBody) => {
  const { tokenId, price, itemId, owner, transactionId, collectionAddress, expireAt } = itemBody;
  if (expireAt && expireAt <= new Date()) {
    throwException(httpStatus.BAD_REQUEST, 'Expire time cannot be less than current now');
  }

  const data = { ...itemBody, expireAt: expireAt.toISOString() };
  const isTokenOwner = await ItemOwner.getItemToken(owner, tokenId);
  if (!isTokenOwner) {
    throwException(httpStatus.BAD_REQUEST, 'Only owner can listing this token');
  }

  return sessionRetryWrite(async (session) => {
    // Insert if not exist, mean first times create ItemListing
    if (!(await ItemListing.create([data], { session }))) {
      throwException(httpStatus.INTERNAL_SERVER_ERROR, 'Cannot listing item');
    }

    // Add record to activity model
    const _activity = {
      historyType: ItemActivityTypes.LISTING,
      tokenId,
      itemId,
      fromUserId: owner,
      toUserId: owner,
      status: DefaultStatus.DEACTIVE,
      transactionId,
      price,
      collectionAddress,
      expireAt,
    };

    const result = await ItemActivity.create([_activity], { session });
    return !!result && data;
  });
};

const deleteItemListingById = async (id) => {
  const _itemListing = await getItemListingById(id);
  if (!_itemListing) {
    throwException(httpStatus.NOT_FOUND, 'Item Listing not found');
  }
  await _itemListing.remove();
  return _itemListing;
};

const cancelItemListingRequest = async (itemBody) => {
  itemBody.status = ListingStatus.ACTIVE;
  const { tokenId, price, itemId, owner, transactionId, collectionAddress } = itemBody;

  const _isTokenOwner = await ItemOwner.getItemToken(owner, tokenId);
  if (!_isTokenOwner) {
    throwException(httpStatus.BAD_REQUEST, 'Only owner can cancel listing this token');
  }

  // Insert if not exist, mean first times create ItemListing
  const _itemListing = await ItemListing.getItemListing({ ...itemBody, status: ListingStatus.ACTIVE });
  if (!_itemListing) {
    throwException(httpStatus.NOT_FOUND, 'Item Listing not found');
  }

  return sessionRetryWrite(async (session) => {
    _itemListing.status = ListingStatus.CANCEL;
    const _saveResult = await _itemListing.save({ session });
    if (!_saveResult || _saveResult.errors) {
      throwException(httpStatus.INTERNAL_SERVER_ERROR, 'Item Listing cancel error');
    }

    // Add record to activity model
    const _activity = {
      historyType: ItemActivityTypes.CANCEL,
      tokenId,
      itemId,
      fromUserId: owner,
      toUserId: owner,
      status: DefaultStatus.DEACTIVE,
      transactionId,
      price,
      collectionAddress,
    };
    const result = await ItemActivity.create([_activity], { session });
    return !!result && itemBody;
  });
};

const updateItemListingStatus = async (itemInfo, status) => {
  // First cancel to disable transferable, this just re-active activities
  // Not in case cancel mean in case listings, this will filter de-active
  const statusCondition = status === ListingStatus.ACTIVE ? ListingStatus.DEACTIVE : status;
  const _itemListing = await getItemListingByFilter(itemInfo, statusCondition);
  if (!_itemListing) {
    throwException(httpStatus.NOT_FOUND, 'Item Listing not found');
  }

  return sessionRetryWrite(async (session) => {
    const { owner, itemId, tokenId, price } = _itemListing;
    const _activityType = status === ListingStatus.ACTIVE ? ItemActivityTypes.LISTING : ItemActivityTypes.CANCEL;
    const _itemActivity = await ItemActivity.findOne({
      historyType: _activityType,
      itemId,
      tokenId,
      price,
      fromUserId: owner,
      status: DefaultStatus.DEACTIVE,
    }).sort({
      createdAt: Sort.DESCENDING,
    });
    if (!_itemActivity) {
      return null;
    }
    _itemActivity.status = DefaultStatus.ACTIVE;
    await _itemActivity.save({ session });

    _itemListing.status = status;
    const result = await _itemListing.save({ session });
    return !!result && !result.errors && _itemListing;
  });
};

module.exports = {
  createItemListing,
  queryItemListings,
  queryItemUnconfirmListing,
  queryItemListingsWithDetails,
  getItemListingById,
  updateItemListingById,
  deleteItemListingById,
  updateItemListingStatus,
  cancelItemListingRequest,
  getItemListingByFilter,
};
