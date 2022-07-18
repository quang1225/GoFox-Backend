const httpStatus = require('http-status');
const mongoose = require('mongoose');
const { ItemOwner, Item, ItemListing, Collection } = require('../models');
const paginate = require('../utils/paginate');
const { numberFullStr } = require('../utils/common');
const { DefaultStatus, Sort } = require('../utils/constants');
const config = require('../config/config');
const { initGlobalWeb3Static } = require('../utils/web3');
const { CollectionStatus } = require('../utils/constants');
const { sessionRetryWrite } = require('../utils/sessionExtension');
const { throwException } = require('../config/exception');

// Joins
const joinItemPrice = [
  {
    $lookup: {
      from: 'itemlistings',
      let: {
        itemId: '$i._id',
      },
      pipeline: [
        {
          $match: { $expr: { $eq: ['$itemId', '$$itemId'] }, status: DefaultStatus.ACTIVE },
        },
        {
          $sort: { createdAt: Sort.DESCENDING },
        },
      ],
      as: 'il',
    },
  },
];
const joinItemCollection = (onlyVerified) => [
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
  { $match: { 'coll.flag': onlyVerified ? CollectionStatus.VERIFIED : { $ne: CollectionStatus.DISABLED } } },
];
const joinItemCategory = [
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
];
const joinItemOwners = (distinctItem = false) => {
  let pipeline = [
    {
      $lookup: {
        from: 'itemowners',
        localField: 'i._id',
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
    {
      $unwind: {
        path: '$o',
        preserveNullAndEmptyArrays: true,
      },
    },
    { $sort: { 'o.updatedAt': Sort.DESCENDING } },
  ];

  if (distinctItem) {
    pipeline = pipeline.concat([
      {
        $group: {
          _id: '$o.itemId',
          owners: { $first: '$$ROOT' },
        },
      },
      {
        $replaceRoot: { newRoot: '$owners' },
      },
    ]);
  }

  return pipeline;
};

const selectItemDetail = {
  _id: '$i._id',
  viewed: '$i.viewed',
  name: '$i.name',
  slug: '$i.slug',
  collectionSlug: '$coll.slug',
  collectionName: '$coll.name',
  avatar: '$i.avatar',
  status: '$i.status',
  description: '$i.description',
  creator: '$i.creator',
  owner: '$o.owner',
  properties: '$i.properties',
  favorites: '$i.favorites',
  countFavorites: { $cond: { if: { $isArray: '$i.favorites' }, then: { $size: '$i.favorites' }, else: 0 } },
  createdBy: '$i.createdBy',
  modifiedBy: '$i.modifiedBy',
  updatedAt: '$i.updatedAt',
  createdAt: '$i.createdAt',
  currentPrice: {
    $ifNull: [
      {
        $let: {
          vars: {
            priceObj: { $arrayElemAt: ['$il', 0] },
          },
          in: '$$priceObj.price',
        },
      },
      0,
    ],
  },
  lastListed: {
    $ifNull: [
      {
        $let: {
          vars: {
            timeListedObj: { $arrayElemAt: ['$il', 0] },
          },
          in: '$$timeListedObj.updatedAt',
        },
      },
      0,
    ],
  },
  expireAt: {
    $ifNull: [
      {
        $let: {
          vars: {
            timeExpireObj: { $arrayElemAt: ['$il', 0] },
          },
          in: '$$timeExpireObj.expireAt',
        },
      },
      0,
    ],
  },
};

const defaultJoinItem = (verifiedCollection) => [
  ...joinItemPrice,
  ...joinItemCollection(verifiedCollection),
  ...joinItemOwners(true),
];

const getItemById = async (id) => {
  const _item = await Item.aggregate([
    { $match: { _id: mongoose.Types.ObjectId(id) } },
    {
      $project: {
        _id: 0,
        i: '$$ROOT',
      },
    },
    ...joinItemOwners(),
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
    {
      $project: {
        _id: '$i._id',
        avatar: '$i.avatar',
        slug: '$i.slug',
        description: '$i.createdAt',
        name: '$i.name',
        favorites: '$i.favorites',
        properties: '$i.properties',
        viewed: '$i.viewed',
        status: '$i.status',
        collection: '$coll',
        owner: '$o',
      },
    },
  ]);

  return _item[0] || {};
};

const createItem = async (itemBody) => {
  const { collectionId, creator, tokenIds, name, avatar, supply = 1 } = itemBody;

  /// This use for feature ERC1155 (1 token with supply > 1)
  /// Exist tokenId => update to itemOwner supply +1
  // const _itemOwner = await ItemOwner.getItemToken(creator, tokenId);
  // if (_itemOwner) {
  //   _itemOwner.supply++;
  //   await _itemOwner.save();
  //   return getItemById(_itemOwner.itemId);
  // }

  // Already create Item (Exist name and avatar)
  const _item = await Item.getExistItem(name, avatar, collectionId);
  // If tokenId not empty => create new, need to confirm
  if (_item && tokenIds && tokenIds.length > 0) {
    // Find exist itemId in itemOwner
    const _itemOwner = await ItemOwner.findOne({
      owner: creator,
      itemId: _item._id,
    });

    // Update tokneId in itemOwner
    if (_itemOwner) {
      const existTokens = _itemOwner.tokenIds.concat(tokenIds);
      _itemOwner.tokenIds = [...new Set(existTokens)];
      await _itemOwner.save();
    }
    return _item;
  }

  return sessionRetryWrite(async (session) => {
    const _newItem = await Item.create([itemBody], { session });
    // If tokenId not empty => create new, need to confirm
    if (tokenIds && tokenIds.length > 0) {
      await ItemOwner.create(
        [
          {
            owner: creator,
            itemId: _newItem[0]._id,
            tokenIds,
            supply,
          },
        ],
        { session }
      );
    }
    return _newItem[0];
  });
};

const createItems = async (items) => {
  const exceptItems = [];
  for (const item of items) {
    Object.assign(item, { status: DefaultStatus.ACTIVE });
    if (!(await createItem(item))) {
      exceptItems.push(item);
    }
  }
  return exceptItems;
};

const createConfirm = async (updateBody) => {
  const { itemId } = updateBody;
  const _item = await Item.findById(itemId);
  if (!_item) {
    throwException(httpStatus.NOT_FOUND, 'Item not found');
  }

  if (_item.status) {
    return true;
  }

  return sessionRetryWrite(async (session) => {
    const { tokenIds } = updateBody;
    const { creator, _id, collectionId } = _item;
    // Find exist itemId in itemOwner
    const _itemOwner = await ItemOwner.findOne({
      owner: creator,
      itemId: _id,
    });

    // Add countItem for items in collection
    await Collection.findByIdAndUpdate(collectionId, { $inc: { countItem: 1 } }, { session });

    // Update tokneId in itemOwner
    if (_itemOwner) {
      const existTokens = _itemOwner.tokenIds.concat(tokenIds);
      _itemOwner.tokenIds = [...new Set(existTokens)];
      await _itemOwner.save({ session });
    } else {
      await ItemOwner.create(
        [
          {
            owner: creator,
            itemId: _item._id,
            tokenIds,
            supply: 1,
          },
        ],
        { session }
      );
    }

    _item.status = DefaultStatus.ACTIVE;
    const result = await _item.save({ session });
    return !!result && !result.errors && _item;
  });
};

const queryItemsWithUserOwners = async (status) => {
  const aggregate = await Item.aggregate([
    {
      $project: {
        _id: 0,
        i: '$$ROOT',
      },
    },
    { $match: { 'i.status': status } },
    {
      $lookup: {
        from: 'users',
        localField: 'i.creator',
        foreignField: '_id',
        as: 'u',
      },
    },
    ...joinItemOwners(),
    {
      $unwind: {
        path: '$u',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $project: {
        _id: '$i._id',
        avatar: '$i.avatar',
        name: '$i.name',
        description: '$i.description',
        status: '$i.status',
        transactionId: '$i.transactionId',
        creator: '$i.creator',
        updatedAt: '$i.updatedAt',

        tokenIds: '$o.tokenIds',
        userAddresses: '$u.walletAddress',
      },
    },
  ]);

  return aggregate || [];
};

const queryItemWithCollections = async (itemId) => {
  const aggregate = await Item.aggregate([
    {
      $project: {
        _id: 0,
        i: '$$ROOT',
      },
    },
    ...joinItemCollection,
    { $match: { 'i._id': itemId } },
    {
      $project: {
        itemId: '$i._id',
        status: '$i.status',
        viewed: '$i.viewed',
        name: '$i.name',

        avatar: '$i.avatar',
        creator: '$i.creator',
        properties: '$i.properties',
        description: '$i.description',
        favorites: '$i.favorites',
        createdAt: '$i.createdAt',
        updatedAt: '$i.updatedAt',
        slug: '$i.slug',

        collectionToken: '$coll.collectionToken',
      },
    },
  ]);

  return aggregate || [];
};

const queryItemOwners = async (itemId) => {
  const aggregate = await Item.aggregate([
    {
      $project: {
        _id: 0,
        i: '$$ROOT',
      },
    },
    ...joinItemOwners(),
    { $match: { 'i._id': itemId } },
    {
      $project: {
        _id: 0,
        tokenIds: '$o.tokenIds',
      },
    },
  ]);
  return aggregate;
};

const queryItemsWithDetails = async (filter, options) => {
  const { page, limit, sortBy } = options;
  const { name, categorySlugs, collectionSlugs, priceMin, priceMax } = filter;

  // filter by Name
  const queryName = name ? { name: { $regex: name, $options: '-i' } } : {};

  // filter by Category Slugs
  const listCategorySlugs = categorySlugs && categorySlugs.split(',');
  const filterByCategories = { $match: listCategorySlugs ? { 'cate.slug': { $in: listCategorySlugs } } : {} };

  // filter by Collection Slugs
  const listCollectionSlugs = collectionSlugs && collectionSlugs.split(',');
  const filterByCollections = { $match: listCollectionSlugs ? { 'coll.slug': { $in: listCollectionSlugs } } : {} };

  // filter by Price
  const queryPriceMin = priceMin ? { $gte: Number(priceMin) } : {};
  const queryPriceMax = priceMax ? { $lte: Number(priceMax) } : {};
  const filterPrice = {
    $match: { currentPrice: { ...queryPriceMin, ...queryPriceMax } },
  };

  // Sort
  const sortArr = sortBy ? sortBy.split(':') : '';
  let sortField = '';
  switch (sortArr[0]) {
    case 'created':
      sortField = 'createdAt';
      break;
    case 'updated':
      sortField = 'updatedAt';
      break;
    case 'price':
      sortField = 'currentPrice';
      break;
    case 'favorited':
      sortField = 'countFavorites';
      break;
    case 'viewed':
      sortField = 'viewed';
      break;
    case 'listed':
      sortField = 'lastListed';
      break;
    default:
      sortField = 'createdAt';
  }
  const sortOrder = sortArr[1] === 'asc' ? 1 : -1;
  const sortQuery = {
    $sort: {
      [sortField]: sortOrder,
    },
  };

  let pipeline = [
    { $match: { status: DefaultStatus.ACTIVE, ...queryName } },
    {
      $project: {
        _id: 0,
        i: '$$ROOT',
      },
    },
  ];

  // filter Categories
  if (listCategorySlugs) {
    pipeline = pipeline.concat(joinItemCategory);
    pipeline.push(filterByCategories);
  }

  // get Prices + Collection info
  // pipeline = pipeline.concat(defaultJoinItem(!userId));
  // temp set to FALSE <=> only not equal to flag DISABLE
  pipeline = pipeline.concat(defaultJoinItem(false));

  // filter Collection
  if (listCollectionSlugs) {
    pipeline.push(filterByCollections);
  }

  // group distinct items
  pipeline.concat([
    {
      $group: {
        _id: '$i',
        items: { $first: '$$ROOT' },
      },
    },
    {
      $replaceRoot: { newRoot: '$items' },
    },
  ]);

  // select props
  pipeline.push({
    $project: { ...selectItemDetail },
  });

  // filter Price ( place below selectItemDetail )
  if (priceMin || priceMax) {
    pipeline.push(filterPrice);
  }

  // sort
  pipeline.push(sortQuery);

  pipeline = pipeline.concat(paginate(page, limit));

  const aggregate = await Item.aggregate(pipeline);

  return aggregate[0] || {};
};

const getItemBySlugDetails = async (slug) => {
  let pipeline = [
    { $match: { slug, status: 1 } },
    {
      $project: {
        _id: 0,
        i: '$$ROOT',
      },
    },
    {
      $lookup: {
        from: 'users',
        localField: 'i.creator',
        foreignField: '_id',
        as: 'auth',
      },
    },
    {
      $unwind: {
        path: '$auth',
        preserveNullAndEmptyArrays: true,
      },
    },
  ];

  pipeline = pipeline.concat(joinItemCategory);
  pipeline = pipeline.concat(joinItemCollection());

  pipeline = pipeline.concat([
    ...joinItemOwners(),
    {
      $lookup: {
        from: 'users',
        localField: 'o.owner',
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
      $addFields: {
        'i.collection': '$coll',
      },
    },
    {
      $addFields: {
        'i.creator': '$auth',
      },
    },
    {
      $addFields: {
        owner: {
          $mergeObjects: ['$o', '$u'],
        },
      },
    },
    {
      $group: {
        _id: '$i',
        owners: {
          $push: {
            id: '$owner._id',
            tokenIds: '$owner.tokenIds',
            supply: '$owner.supply',
            fullname: '$owner.fullname',
            email: '$owner.email',
            isEmailVerified: '$owner.isEmailVerified',
            metamaskToken: '$owner.metamaskToken',
            walletAddress: '$owner.walletAddress',
            username: '$owner.username',
          },
        },
        categories: {
          $push: {
            name: '$cate.name',
            slug: '$cate.slug',
          },
        },
      },
    },
    {
      $project: {
        _id: '$_id._id',
        status: '$_id.status',
        viewed: '$_id.viewed',
        name: '$_id.name',
        avatar: '$_id.avatar',
        creator: '$_id.creator',
        properties: '$_id.properties',
        description: '$_id.description',
        favorites: '$_id.favorites',
        createdAt: '$_id.createdAt',
        updatedAt: '$_id.updatedAt',
        slug: '$_id.slug',
        collection: '$_id.collection',
        fullname: '$_id.fullname',
        email: '$_id.email',
        isEmailVerified: '$_id.isEmailVerified',
        metamaskToken: '$_id.metamaskToken',
        walletAddress: '$_id.walletAddress',
        username: '$_id.username',

        owners: 1,
        categories: { $cond: [{ $eq: ['$categories', [{}]] }, [], '$categories'] },
      },
    },
  ]);

  const aggregate = await Item.aggregate(pipeline);

  const result = aggregate[0] || {};
  if (result._id) {
    await Item.findByIdAndUpdate(result._id, { $inc: { viewed: 1 } });
  }

  return result;
};

const getItemBySlug = async (slug) => {
  return Item.findOne({ slug });
};

const updateItemById = async (itemId, updateBody) => {
  const _item = await Item.findById(itemId);
  if (!_item) {
    throwException(httpStatus.NOT_FOUND, 'Item not found');
  }

  Object.assign(_item, updateBody);
  await _item.save();
  return _item;
};

const deleteItemById = async (itemId) => {
  const _item = await getItemById(itemId);
  if (!_item) {
    throwException(httpStatus.NOT_FOUND, 'Item not found');
  }
  await _item.findOneAndDelete({ _id: itemId }, false);
  return _item;
};

const favoriteItemBySlug = async (itemSlug, userId) => {
  const _item = await Item.findOne({ slug: itemSlug });
  if (!_item) {
    throwException(httpStatus.NOT_FOUND, 'Item not found');
  }

  const isRemoveFavorite = await Item.findOne({
    _id: _item._id,
    favorites: {
      $elemMatch: { $in: [mongoose.Types.ObjectId(userId)] },
    },
  });

  if (isRemoveFavorite) {
    await Item.updateOne({ _id: _item._id }, { $pull: { favorites: mongoose.Types.ObjectId(userId) } });
    return false;
  }

  _item.favorites.push(mongoose.Types.ObjectId(userId));
  await _item.save();
  return true;
};

const generateSignature = async (collectionAddress, ownerAddress, ownerId, itemId, tokenId) => {
  const web3 = await initGlobalWeb3Static();

  const listing = await ItemListing.findOne({ itemId, owner: ownerId, tokenId, status: DefaultStatus.ACTIVE }).sort({
    createdAt: Sort.DESCENDING,
  });

  if (!listing) {
    throwException(httpStatus.NOT_FOUND, 'Listing not found');
  }

  const privateKey = config.network.privateKeyAdmin;
  const amount = web3.utils.toWei(numberFullStr(listing.price), 'ether');
  const message = web3.utils
    .soliditySha3(
      { t: 'address', v: collectionAddress },
      { t: 'address', v: ownerAddress },
      { t: 'uint256', v: tokenId },
      { t: 'uint256', v: amount }
    )
    .toString('hex');
  const { signature } = web3.eth.accounts.sign(message, privateKey);

  return signature;
};

module.exports = {
  queryItemsWithUserOwners,
  createItem,
  createConfirm,
  queryItemOwners,
  queryItemsWithDetails,
  queryItemWithCollections,
  getItemById,
  updateItemById,
  deleteItemById,
  getItemBySlug,
  getItemBySlugDetails,
  favoriteItemBySlug,
  createItems,
  defaultJoinItem,
  joinItemCategory,
  selectItemDetail,
  generateSignature,
};
