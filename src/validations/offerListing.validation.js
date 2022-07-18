const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createOfferListing = {
  body: Joi.object().keys({
    itemId: Joi.required().custom(objectId),
    price: Joi.number().required(),
    offerUserId: Joi.required().custom(objectId),
  }),
};

const getOfferListings = {
  query: Joi.object().keys({
    itemId: Joi.custom(objectId),
    price: Joi.number(),
    offerUserId: Joi.custom(objectId),
    status: Joi.number(),
    sortBy: Joi.number(),
    limit: Joi.number(),
    page: Joi.number(),
  }),
};

const getOfferListing = {
  params: Joi.object().keys({
    offerListingId: Joi.required().custom(objectId),
  }),
};

const updateOfferListing = {
  params: Joi.object().keys({
    offerListingId: Joi.required().custom(objectId),
  }),
  body: Joi.object()
    .keys({
      itemId: Joi.required().custom(objectId),
      price: Joi.number().required(),
      salePrice: Joi.number(),
      offerUserId: Joi.required().custom(objectId),
    })
    .min(1),
};

const deleteOfferListing = {
  params: Joi.object().keys({
    offerListingId: Joi.required().custom(objectId),
  }),
};

module.exports = {
  createOfferListing,
  getOfferListings,
  getOfferListing,
  updateOfferListing,
  deleteOfferListing,
};
