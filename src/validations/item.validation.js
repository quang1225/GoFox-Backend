const Joi = require('joi');
const { objectId, arrayObjectId } = require('./custom.validation');

const createItem = {
  body: Joi.object().keys({
    tokenIds: Joi.array().allow(null),
    name: Joi.string(),
    collectionId: Joi.required().custom(objectId),
    categoryIds: Joi.required().custom(arrayObjectId),
    avatar: Joi.string(),
    sort: Joi.number(),
    creator: Joi.required().custom(objectId),
    properties: Joi.array(),
    description: Joi.string().allow(''),
  }),
};

const createConfirm = {
  body: Joi.object().keys({
    tokenIds: Joi.array().required(),
    collectionId: Joi.required().custom(objectId),
    creator: Joi.required().custom(objectId),
    itemId: Joi.required().custom(objectId),
  }),
};

const createItems = {
  body: Joi.object().keys({
    items: Joi.array().required(),
  }),
};

const getItems = {
  query: Joi.object().keys({
    name: Joi.string(),
    tokenIds: Joi.array(),
    userId: Joi.string(),
    categorySlugs: Joi.string(),
    collectionSlugs: Joi.string(),
    priceMin: Joi.string(),
    priceMax: Joi.string(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getItem = {
  params: Joi.object().keys({
    itemId: Joi.string().custom(objectId),
  }),
};

const getItemBySlug = {
  params: Joi.object().keys({
    itemSlug: Joi.string(),
  }),
};

const updateItem = {
  params: Joi.object().keys({
    itemId: Joi.required().custom(objectId),
  }),
  body: Joi.object().keys({
    transactionId: Joi.string().allow(''),
    name: Joi.string(),
    avatar: Joi.string(),
    properties: Joi.array(),
    favorites: Joi.array(),
    description: Joi.string().allow(''),
    categoryIds: Joi.custom(arrayObjectId),
    status: Joi.number(),
    sort: Joi.number(),
  }),
};

const deleteItem = {
  params: Joi.object().keys({
    itemId: Joi.string().custom(objectId),
  }),
};

const requestTransferItem = {
  body: Joi.object().keys({
    tokenId: Joi.string(),
    itemId: Joi.string().custom(objectId),
    transactionId: Joi.string(),
    collectionAddress: Joi.string(),
    owner: Joi.string().custom(objectId),
    receiver: Joi.string().custom(objectId),
    price: Joi.number(),
    total: Joi.number().integer(),
  }),
};

const confirmTransferItem = {
  body: Joi.object().keys({
    itemId: Joi.string().custom(objectId),
    transactionId: Joi.string(),
    status: Joi.number(),
  }),
};

const signatureTransferItem = {
  body: Joi.object().keys({
    collectionAddress: Joi.string(),
    ownerAddress: Joi.string(),
    tokenId: Joi.string(),
    itemId: Joi.string(),
    ownerId: Joi.string(),
  }),
};

const favoriteItem = {
  body: Joi.object().keys({
    userId: Joi.string().custom(objectId).required(),
    itemSlug: Joi.string().required(),
  }),
};

module.exports = {
  createItem,
  createConfirm,
  createItems,
  getItems,
  getItem,
  getItemBySlug,
  updateItem,
  deleteItem,
  requestTransferItem,
  confirmTransferItem,
  signatureTransferItem,
  favoriteItem,
};
