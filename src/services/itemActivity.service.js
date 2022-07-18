const mongoose = require('mongoose');
const httpStatus = require('http-status');
const { ItemActivity } = require('../models');
const paginate = require('../utils/paginate');
const { Sort } = require('../utils/constants');
const { throwException } = require('../config/exception');

const queryItemActivityById = async (id) => {
  const _activity = await ItemActivity.findById(id);
  return _activity;
};

const queryItemActivity = async (filter, options) => {
  const { page, limit } = options;
  const { historyType, itemId, fromUserId, toUserId } = filter;

  const queryHistoryType = historyType ? { 'a.historyType': historyType } : {};
  const queryItemId = itemId ? { 'a.itemId': mongoose.Types.ObjectId(itemId) } : {};
  const queryFromUserId = fromUserId ? { 'a.fromUserId': mongoose.Types.ObjectId(fromUserId) } : {};
  const queryToUserId = toUserId ? { 'a.toUserId': mongoose.Types.ObjectId(toUserId) } : {};

  const pipeline = [
    {
      $project: {
        _id: 0,
        a: '$$ROOT',
      },
    },
    {
      $match: { 'a.status': 1, ...queryHistoryType },
    },
    {
      $lookup: {
        localField: 'a.itemId',
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
        localField: 'a.fromUserId',
        from: 'users',
        foreignField: '_id',
        as: 'f',
      },
    },
    {
      $unwind: {
        path: '$f',
        preserveNullAndEmptyArrays: true,
      },
    },
    { $match: { 'f.status': 1, ...queryFromUserId } },
    {
      $lookup: {
        localField: 'a.toUserId',
        from: 'users',
        foreignField: '_id',
        as: 't',
      },
    },
    {
      $unwind: {
        path: '$t',
        preserveNullAndEmptyArrays: true,
      },
    },
    { $match: { 't.status': 1, ...queryToUserId } },
    /// //
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
        preserveNullAndEmptyArrays: true,
      },
    },
    { $match: { 'i.status': 1 } },

    /// /
    {
      $project: {
        _id: '$a._id',
        price: '$a.price',
        createdAt: '$a.createdAt',
        historyType: '$a.historyType',
        tokenId: '$a.tokenId',

        'fromUser._id': '$f._id',
        'fromUser.fullname': '$f.fullname',
        'fromUser.username': '$f.username',
        'fromUser.email': '$f.email',
        'fromUser.walletAddress': '$f.walletAddress',
        'fromUser.avatar': '$f.avatar',

        'toUser._id': '$t._id',
        'toUser.fullname': '$t.fullname',
        'toUser.username': '$t.username',
        'toUser.email': '$t.email',
        'toUser.walletAddress': '$t.walletAddress',
        'toUser.avatar': '$t.avatar',

        'item._id': '$i._id',
        'item.name': '$i.name',
        'item.avatar': '$i.avatar',
        'item.collectionId': '$i.collectionId',
        'item.status': '$i.status',
        'item.itemslug': '$i.slug',
        'item.collectionslug': '$coll.slug',
      },
    },
    {
      $sort: {
        createdAt: Sort.DESCENDING,
      },
    },
    { $limit: 1000 },
  ].concat(paginate(page, limit));
  const _aggregate = ItemActivity.aggregate(pipeline);

  return (await _aggregate)[0] || {};
};

const updateItemActivityById = async (id, body) => {
  const _activity = await ItemActivity.findById(id);
  if (!_activity) {
    throwException(httpStatus.NOT_FOUND, 'Activity not found');
  }
  Object.assign(_activity, body);
  await _activity.save();
  return _activity;
};

module.exports = {
  queryItemActivity,
  queryItemActivityById,
  updateItemActivityById,
};
