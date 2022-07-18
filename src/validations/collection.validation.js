const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createCollection = {
  body: Joi.object().keys({
    userId: Joi.string().required().custom(objectId),
    name: Joi.string().required(),
    avatar: Joi.string(),
    contractToken: Joi.string().required(),
    coverImage: Joi.string(),
    description: Joi.string().allow(''),
    sort: Joi.number(),
    networkName: Joi.string(),
    flag: Joi.string().allow(''),
    website: Joi.string().allow(''),
    twitter: Joi.string().allow(''),
    instagram: Joi.string().allow(''),
    telegram: Joi.string().allow(''),
    discord: Joi.string().allow(''),
    medium: Joi.string().allow(''),
    youtube: Joi.string().allow(''),
  }),
};

const getCollections = {
  query: Joi.object().keys({
    name: Joi.string(),
    userId: Joi.string().custom(objectId),
    categorySlugs: Joi.string(),
    hasItem: Joi.boolean(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer().greater(0),
  }),
};

const getCollection = {
  params: Joi.object().keys({
    collectionId: Joi.string().custom(objectId),
  }),
};

const getCollectionBySlug = {
  params: Joi.object().keys({
    collectionSlug: Joi.string(),
  }),
};

const updateCollection = {
  params: Joi.object().keys({
    collectionId: Joi.required().custom(objectId),
  }),
  body: Joi.object()
    .keys({
      name: Joi.string(),
      avatar: Joi.string(),
      coverImage: Joi.string().allow(''),
      description: Joi.string().allow(''),
      sort: Joi.number(),
      status: Joi.number(),
      networkName: Joi.string(),
      flag: Joi.string().allow(''),
      website: Joi.string().allow(''),
      twitter: Joi.string().allow(''),
      instagram: Joi.string().allow(''),
      telegram: Joi.string().allow(''),
      discord: Joi.string().allow(''),
      medium: Joi.string().allow(''),
      youtube: Joi.string().allow(''),
    })
    .min(1),
};

const deleteCollection = {
  params: Joi.object().keys({
    collectionId: Joi.string().custom(objectId),
  }),
};

const requestVerifyCollection = {
  body: Joi.object().keys({
    collectionId: Joi.string().custom(objectId),
    collectionLink: Joi.string(),
    fullname: Joi.string(),
    twitter: Joi.string().allow(''),
    facebook: Joi.string().allow(''),
    linkedIn: Joi.string().allow(''),
    email: Joi.string(),
  }),
};

module.exports = {
  createCollection,
  getCollections,
  getCollection,
  getCollectionBySlug,
  updateCollection,
  deleteCollection,
  requestVerifyCollection,
};
