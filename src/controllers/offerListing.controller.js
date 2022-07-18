const httpStatus = require('http-status');
const pick = require('../utils/pick');
const catchAsync = require('../utils/catchAsync');
const { offerListingService, itemService, userService } = require('../services');
const { throwException } = require('../config/exception');

const createOfferListing = catchAsync(async (req, res) => {
  const item = await itemService.getItemById(req.body.listingId);
  if (!item) {
    throwException(httpStatus.NOT_FOUND, `Not found Item with itemId: ${req.body.listingId}`);
  }
  const user = await userService.getUserById(req.body.offerUserId);
  if (!user) {
    throwException(httpStatus.NOT_FOUND, `Not found User with offerUserId: ${req.body.offerUserId}`);
  }
  const offerListing = await offerListingService.createOfferListing(req.body);
  res.status(httpStatus.CREATED).send(offerListing);
});

const getOfferListings = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['itemId', 'price', 'status', 'offerUserId']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await offerListingService.queryOfferListing(filter, options);
  res.send(result);
});

const getOfferListing = catchAsync(async (req, res) => {
  const offerListing = await offerListingService.getOfferListingById(req.params.offerListingId);
  if (!offerListing) {
    throwException(httpStatus.NOT_FOUND, 'OfferListing not found');
  }
  res.send(offerListing);
});

const updateOfferListing = catchAsync(async (req, res) => {
  const offerListing = await offerListingService.updateOfferListingById(req.params.offerListingId, req.body);
  res.send(offerListing);
});

const deleteOfferListing = catchAsync(async (req, res) => {
  await offerListingService.deleteOfferListingById(req.params.offerListingId);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  createOfferListing,
  getOfferListings,
  getOfferListing,
  updateOfferListing,
  deleteOfferListing,
};
