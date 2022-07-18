const httpStatus = require('http-status');
const mongoose = require('mongoose');
const { Collection, RequestVerifyCollection } = require('../models');
const paginate = require('../utils/paginate');
const { sessionRetryWrite } = require('../utils/sessionExtension');
const { ItemActivityTypes, DefaultStatus, CollectionStatus, Sort } = require('../utils/constants');
const { throwException } = require('../config/exception');

const createCollection = async (collectionBody) => {
  const _collection = await Collection.create(collectionBody);
  return _collection;
};

const queryCollections = async (filter, options) => {
  const { page, limit } = options;
  const { name, userId, categorySlugs, hasItem } = filter;

  const queryName = name ? { name: { $regex: name, $options: '-i' } } : {};
  const queryHasItem = hasItem ? { countItem: { $gt: 0 } } : {};

  let listCategorySlugs = [];
  if (categorySlugs) {
    listCategorySlugs = categorySlugs.split(',');
  }

  const filterByCategories = [
    {
      $lookup: {
        localField: 'i._id',
        from: 'itemincategories',
        foreignField: 'itemId',
        as: 'iic',
      },
    },
    {
      $unwind: {
        path: '$iic',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        localField: 'iic.categoryId',
        from: 'categories',
        foreignField: '_id',
        as: 'cate',
      },
    },
    {
      $unwind: {
        path: '$cate',
        preserveNullAndEmptyArrays: true,
      },
    },
    { $match: { 'cate.status': 1, 'cate.slug': { $in: listCategorySlugs } } },
    {
      $group: {
        _id: '$c._id',
        collection: { $first: '$$ROOT' },
        countItem: { $sum: 1 },
      },
    },
    {
      $replaceRoot: { newRoot: { $mergeObjects: ['$collection', { countItem: '$countItem' }] } },
    },
  ];

  let pipeline = [
    { $match: { flag: userId ? { $ne: CollectionStatus.DISABLED } : CollectionStatus.VERIFIED, ...queryName } },
    {
      $project: {
        _id: 0,
        c: '$$ROOT',
      },
    },
    {
      $lookup: {
        localField: 'c._id',
        from: 'items',
        foreignField: 'collectionId',
        as: 'i',
      },
    },
  ];

  if (categorySlugs) {
    pipeline.push({
      $unwind: {
        path: '$i',
        preserveNullAndEmptyArrays: true,
      },
    });
  }

  // prevent remove collection with 0 item for MyCollection
  if (hasItem) {
    pipeline.push({ $match: { 'i.status': 1 } });
  }

  if (categorySlugs) {
    pipeline = pipeline.concat(filterByCategories);
  } else {
    pipeline.push({
      $addFields: {
        countItem: {
          $size: {
            $filter: {
              input: '$i',
              as: 'item',
              cond: { $eq: ['$$item.status', 1] },
            },
          },
        },
      },
    });
  }

  let queryUserId = {};
  if (userId) {
    queryUserId = {
      $or: [
        // match collection owner
        { 'u._id': mongoose.Types.ObjectId(userId) },
        // filter owner item in the collection
        {
          $expr: { $in: [mongoose.Types.ObjectId(userId), '$o.owner'] },
        },
      ],
    };
  }

  pipeline = pipeline.concat([
    { $match: { ...queryHasItem } },
    {
      $lookup: {
        localField: 'c.userId',
        from: 'users',
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
      $lookup: {
        localField: 'i._id',
        from: 'itemowners',
        foreignField: 'itemId',
        as: 'o',
      },
    },
    {
      $addFields: {
        o: {
          $filter: {
            input: '$o',
            as: 'token',
            cond: { $gt: [{ $size: '$$token.tokenIds' }, 0] },
          },
        },
      },
    },
    { $match: { ...queryUserId } },
  ]);

  pipeline.push({
    $project: {
      _id: '$c._id',
      avatar: '$c.avatar',
      description: '$c.description',
      networkName: '$c.networkName',
      coverImage: { $ifNull: ['$c.coverImage', ''] },
      sort: '$c.sort',
      flag: '$c.flag',
      createdAt: '$c.createdAt',
      modified: '$c.modified',
      contractToken: '$c.contractToken',
      owner: '$u',
      name: '$c.name',
      slug: '$c.slug',
      createdBy: '$c.createdBy',
      modifiedBy: '$c.modifiedBy',
      updatedAt: '$c.updatedAt',
      countItem: '$countItem',
    },
  });

  pipeline = pipeline.concat(paginate(page, limit));

  const _collections = await Collection.aggregate(pipeline);

  return _collections;
};
// Trending based on transaction 'transfer'
const getTrendingCollections = async () => {
  const _collectionstrending = Collection.aggregate([
    { $match: { flag: CollectionStatus.VERIFIED } },
    {
      $project: {
        _id: 0,
        c: '$$ROOT',
      },
    },
    {
      $lookup: {
        localField: 'c._id',
        from: 'items',
        foreignField: 'collectionId',

        as: 'i',
      },
    },

    {
      $unwind: {
        path: '$i',
        preserveNullAndEmptyArrays: true,
      },
    },

    {
      $match: {
        'i.status': 1,
      },
    },

    {
      $group: {
        _id: '$c._id',
        collection: { $first: '$$ROOT' },
        countItem: { $sum: 1 },
      },
    },
    {
      $replaceRoot: { newRoot: { $mergeObjects: ['$collection', { countItem: '$countItem' }] } },
    },
    {
      $lookup: {
        localField: 'c.userId',
        from: 'users',
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
    {
      $match: {
        'u.status': 1,
      },
    },
    {
      $lookup: {
        localField: 'i._id',
        from: 'itemactivities',
        foreignField: 'itemId',
        as: 'a',
      },
    },
    {
      $unwind: {
        path: '$a',
        preserveNullAndEmptyArrays: false,
      },
    },
    {
      $match: {
        'a.historyType': ItemActivityTypes.TRANSFER,
      },
    },

    {
      $group: {
        _id: '$c._id',
        collection: { $first: '$c' },
        username: { $first: '$u.username' },
        walletAddress: { $first: '$u.walletAddress' },
        countItem: { $first: '$countItem' },
        countActivity: { $sum: 1 },
      },
    },

    {
      $replaceRoot: {
        newRoot: {
          $mergeObjects: [
            '$collection',
            { username: '$username' },
            { walletAddress: '$walletAddress' },
            { countItem: '$countItem' },
            { countActivity: '$countActivity' },
          ],
        },
      },
    },
    {
      $sort: {
        countActivity: Sort.DESCENDING,
      },
    },
    { $limit: 9 },
  ]);

  return _collectionstrending;
};

const getCollectionById = async (id) => {
  const _pipeline = [
    {
      $project: {
        _id: 0,
        c: '$$ROOT',
      },
    },
    {
      $match: { 'c._id': mongoose.Types.ObjectId(id) },
    },
    {
      $lookup: {
        localField: 'c._id',
        from: 'items',
        foreignField: 'collectionId',
        as: 'i',
      },
    },
    {
      $addFields: {
        isAllowDelete: {
          $cond: {
            if: { $gt: [{ $size: '$i' }, 0] },
            then: false,
            else: true,
          },
        },
      },
    },
    {
      $replaceRoot: {
        newRoot: {
          $mergeObjects: ['$c', { isAllowDelete: '$isAllowDelete' }, { countItems: { $size: '$i' } }],
        },
      },
    },
  ];

  const _aggregate = await Collection.aggregate(_pipeline);
  return _aggregate[0] || {};
};

const getCollectionBySlug = async (slug) => {
  const _collections = Collection.aggregate([
    {
      $match: { slug, flag: { $ne: CollectionStatus.DISABLED } },
    },
    {
      $project: {
        _id: 0,
        c: '$$ROOT',
      },
    },
    {
      $lookup: {
        from: 'items',
        let: {
          collectionId: '$c._id',
        },
        pipeline: [
          {
            $match: { $expr: { $eq: ['$collectionId', '$$collectionId'] }, status: DefaultStatus.ACTIVE },
          },
        ],
        as: 'i',
      },
    },
    {
      $lookup: {
        from: 'requestverifycollections',
        localField: 'c._id',
        foreignField: 'collectionId',
        as: 'r',
      },
    },
    {
      $unwind: {
        path: '$r',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $project: {
        _id: '$c._id',
        avatar: '$c.avatar',
        name: '$c.name',
        slug: '$c.slug',
        creator: '$c.userId',
        flag: { $ifNull: ['$c.flag', CollectionStatus.UNVERIFIED] },
        description: '$c.description',
        networkName: '$c.networkName',
        coverImage: { $ifNull: ['$c.coverImage', ''] },
        sort: '$c.sort',
        createdAt: '$c.createdAt',
        modified: '$c.modified',
        contractToken: '$c.contractToken',
        countItem: {
          $size: '$i',
        },
      },
    },
  ]);

  return (await _collections)[0] || [];
};

const updateCollectionById = async (collectionId, updateBody) => {
  const _collection = await Collection.findById(collectionId);
  if (!_collection) {
    throwException(httpStatus.NOT_FOUND, 'Collection not found');
  }
  Object.assign(_collection, updateBody);
  await _collection.save();
  return _collection;
};

const deleteCollectionById = async (collectionId) => {
  const _collection = await getCollectionById(collectionId);
  if (!_collection) {
    throwException(httpStatus.NOT_FOUND, 'Collection not found');
  }

  if (!_collection || !_collection.isAllowDelete) {
    throwException(httpStatus.BAD_REQUEST, 'Collection is not allow delete');
  }

  return Collection.findOneAndDelete({ _id: _collection._id }, false);
};

const getRequestVerifyCollection = async (filter) => {
  const _request = await RequestVerifyCollection(filter);
  return _request;
};

const requestVerifyCollection = async (data) => {
  const { collectionId, twitter, email, facebook, linkedIn } = data;
  const _request = await getRequestVerifyCollection({ collectionId, twitter, email, facebook, linkedIn });

  if (!_request) {
    throwException(httpStatus.BAD_REQUEST, "Verify request has sent. We'll contact you soon.");
  }

  return sessionRetryWrite(
    async (session) =>
      (await Collection.updateOne({ _id: collectionId }, { $set: { flag: CollectionStatus.REQUESTING } }, { session })) &&
      (await RequestVerifyCollection.create([data], { session }))
  );
};

const isExistCollection = async (address) => {
  const result = await Collection.findOne({ contractToken: address });
  return !!result;
};

module.exports = {
  createCollection,
  queryCollections,
  getCollectionById,
  getCollectionBySlug,
  updateCollectionById,
  deleteCollectionById,
  getTrendingCollections,
  requestVerifyCollection,
  isExistCollection,
};
