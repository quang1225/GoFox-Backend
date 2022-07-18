const { Collection } = require('../models');
const { User } = require('../models');
const { CollectionStatus } = require('../utils/constants');

const searchHeader = async (name) => {
  const collections = await Collection.aggregate([
    { $match: { flag: CollectionStatus.VERIFIED, name: { $regex: name, $options: '-i' } } },
    {
      $project: {
        _id: 0,
        coll: '$$ROOT',
      },
    },
    {
      $lookup: {
        localField: 'coll._id',
        from: 'items',
        foreignField: 'collectionId',
        as: 'i',
      },
    },
    {
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
    },
    { $limit: 18 },
    {
      $project: {
        _id: '$coll._id',
        avatar: '$coll.avatar',
        description: '$coll.description',
        networkName: '$coll.networkName',
        coverImage: { $ifNull: ['$coll.coverImage', ''] },
        sort: '$coll.sort',
        status: '$coll.status',
        createdAt: '$coll.createdAt',
        modified: '$coll.modified',
        contractToken: '$coll.contractToken',
        name: '$coll.name',
        slug: '$coll.slug',
        createdBy: '$coll.createdBy',
        modifiedBy: '$coll.modifiedBy',
        updatedAt: '$coll.updatedAt',
        countItem: '$countItem',
      },
    },
  ]);
  const usernames = await User.find({ username: { $regex: name, $options: '-i' } }).limit(5);

  return { collections, usernames };
};

module.exports = {
  searchHeader,
};
