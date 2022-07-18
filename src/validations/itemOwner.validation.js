const Joi = require('joi');
const { objectId } = require('./custom.validation');

const getOwnerItems = {
  params: Joi.object().keys({
    ownerId: Joi.string().custom(objectId),
  }),
};

const updateItemOwner = {
  body: Joi.object().keys({
    itemId: Joi.string().custom(objectId),
    tokenId: Joi.string(),
    collectionAddress: Joi.string().allow(''),
    newOwner: Joi.string().allow(''),
    oldOwner: Joi.string().allow(''),
    price: Joi.number().allow(0),
  }),
};

module.exports = {
  getOwnerItems,
  updateItemOwner,
};
