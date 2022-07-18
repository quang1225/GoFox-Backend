const httpStatus = require('http-status');
const mongoose = require('mongoose');
const { OfferListing } = require('../models');
const paginate = require('../utils/paginate');
const { throwException } = require('../config/exception');

const createOfferListing = async (offerListingBody) => {
  const _offerListing = await OfferListing.create(offerListingBody);
  return _offerListing;
};
const queryOfferListing = async (filter, options) => {
  const { page, limit } = options;
  const { itemId, price, offerUserId, status } = filter;

  const queryItemId = itemId ? { 'o.itemId': mongoose.Types.ObjectId(itemId) } : {};
  const queryOfferUserId = offerUserId ? { 'o.offerUserId': mongoose.Types.ObjectId(offerUserId) } : {};
  const queryStatus = status ? { 'o.status': status } : {};
  const queryPrice = price ? { 'o.price': price } : {};

  const pipeline = [
    {
      $project: {
        _id: 0,
        o: '$$ROOT',
      },
    },
    {
      $match: { ...queryStatus, ...queryPrice },
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
        localField: 'l.offerUserId',
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
    { $match: { 'u.status': 1, ...queryOfferUserId } },
    {
      $project: {
        _id: '$o._id',
        status: '$o.status',
        salePrice: '$o.salePrice',
        price: '$o.price',

        'offerUser._id': '$u._id',
        'offerUser.fullname': '$u.fullname',
        'offerUser.email': '$u.email',
        'offerUser.avatar': '$u.avatar',
        'offerUser.walletAddress': '$u.walletAddress',

        'item.name': '$i.name',
        'item.slug': '$i.slug',
        'item.collectionId': '$i.collectionId',
        'item.status': '$i.status',
      },
    },
  ].concat(paginate(page, limit));
  const aggregate = await OfferListing.aggregate(pipeline);

  return aggregate[0] || {};
};

const getOfferListingById = async (id) => {
  return OfferListing.findById(id);
};

const updateOfferListingById = async (offerListingId, updateBody) => {
  const _offerListing = await getOfferListingById(offerListingId);
  if (!_offerListing) {
    throwException(httpStatus.NOT_FOUND, 'OfferListing not found');
  }
  Object.assign(_offerListing, updateBody);
  await _offerListing.save();
  return _offerListing;
};

const deleteOfferListingById = async (offerListingId) => {
  const _offerListing = await getOfferListingById(offerListingId);
  if (!_offerListing) {
    throwException(httpStatus.NOT_FOUND, 'OfferListing not found');
  }
  await _offerListing.remove();
  return _offerListing;
};

module.exports = {
  createOfferListing,
  queryOfferListing,
  getOfferListingById,
  updateOfferListingById,
  deleteOfferListingById,
};
