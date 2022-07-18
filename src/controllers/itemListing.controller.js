const httpStatus = require('http-status');
const pick = require('../utils/pick');
const catchAsync = require('../utils/catchAsync');
const { itemListingService } = require('../services');
const { throwException } = require('../config/exception');

const createItemListing = catchAsync(async (req, res) => {
  const itemListing = await itemListingService.createItemListing(req.body);
  if (!itemListing) {
    throwException(httpStatus.INTERNAL_SERVER_ERROR, 'Item Listing create failed');
  }
  res.status(httpStatus.CREATED).send(itemListing);
});

const getItemListings = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['itemId', 'owner', 'status']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await itemListingService.queryItemListingsWithDetails(filter, options);
  res.send(result);
});

const getItemListing = catchAsync(async (req, res) => {
  const itemListing = await itemListingService.getItemListingById(req.params.itemListingId);
  if (!itemListing) {
    throwException(httpStatus.NOT_FOUND, 'Item Listing not found');
  }
  res.send(itemListing);
});

const updateItemListing = catchAsync(async (req, res) => {
  const itemListing = await itemListingService.updateItemListingById(req.params.itemListingId, req.body);
  res.send(itemListing);
});

const deleteItemListing = catchAsync(async (req, res) => {
  await itemListingService.deleteItemListingById(req.params.itemListingId);
  res.status(httpStatus.NO_CONTENT).send();
});

const updateItemListingStatus = catchAsync(async (req, res) => {
  const { status } = req.body;
  const itemListing = await itemListingService.updateItemListingStatus(req.body, status);
  res.send(itemListing);
});

const cancelItemListingRequest = catchAsync(async (req, res) => {
  const itemListing = await itemListingService.cancelItemListingRequest(req.body);
  if (!itemListing) {
    throwException(httpStatus.INTERNAL_SERVER_ERROR, 'Item Listing cancel failed');
  }
  res.send(itemListing);
});

module.exports = {
  createItemListing,
  getItemListings,
  getItemListing,
  updateItemListing,
  deleteItemListing,
  updateItemListingStatus,
  cancelItemListingRequest,
};
