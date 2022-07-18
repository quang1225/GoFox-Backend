const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createItemListing = {
  body: Joi.object().keys({
    itemId: Joi.required().custom(objectId),
    tokenId: Joi.string(),
    collectionAddress: Joi.string(),
    price: Joi.number().precision(18),
    owner: Joi.required().custom(objectId),
    expireAt: Joi.date().default(null).allow(null),
  }),
};

const getItemListings = {
  query: Joi.object().keys({
    itemId: Joi.custom(objectId),
    owner: Joi.custom(objectId),
    status: Joi.number(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getItemListing = {
  params: Joi.object().keys({
    itemListingId: Joi.string().custom(objectId),
  }),
};

const updateItemListing = {
  params: Joi.object().keys({
    itemListingId: Joi.required().custom(objectId),
  }),
};

const deleteItemListing = {
  params: Joi.object().keys({
    itemListingId: Joi.required().custom(objectId),
  }),
};

const updateItemListingStatus = {
  body: Joi.object().keys({
    tokenId: Joi.string(),
    itemId: Joi.string().custom(objectId),
    owner: Joi.string().custom(objectId),
    price: Joi.number(),
    status: Joi.number(),
    collectionAddress: Joi.string(),
    expireAt: Joi.date().default(null).allow(null),
  }),
};

const cancelItemListingRequest = {
  body: Joi.object().keys({
    tokenId: Joi.string(),
    itemId: Joi.string().custom(objectId),
    owner: Joi.string().custom(objectId),
    price: Joi.number(),
    status: Joi.number(),
    collectionAddress: Joi.string(),
    transactionId: Joi.string().allow(''),
  }),
};

module.exports = {
  createItemListing,
  getItemListings,
  getItemListing,
  updateItemListing,
  deleteItemListing,
  updateItemListingStatus,
  cancelItemListingRequest,
};
