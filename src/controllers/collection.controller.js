const httpStatus = require('http-status');
const pick = require('../utils/pick');
const catchAsync = require('../utils/catchAsync');
const { collectionService } = require('../services');
const { throwException } = require('../config/exception');
const { cacheRequest } = require('../utils/cacheExtension');

const createCollection = catchAsync(async (req, res) => {
  const collection = await collectionService.createCollection(req.body);
  res.status(httpStatus.CREATED).send(collection);
});

const getCollections = catchAsync(
  cacheRequest(async (req, res) => {
    const filter = pick(req.query, ['name', 'userId', 'categorySlugs', 'hasItem']);
    const options = pick(req.query, ['sortBy', 'limit', 'page']);
    const result = await collectionService.queryCollections(filter, options);
    res.send(result[0] || {});

    // temp return data to cache
    return result[0] || {};
  })
);

const getTrendingCollections = catchAsync(
  cacheRequest(async (req, res) => {
    const result = await collectionService.getTrendingCollections();
    res.send(result);

    // temp return data to cache
    return result;
  })
);

const getCollection = catchAsync(async (req, res) => {
  const collection = await collectionService.getCollectionById(req.params.collectionId);
  if (!collection) {
    throwException(httpStatus.NOT_FOUND, 'Collection not found');
  }
  res.send(collection);
});

const getCollectionBySlug = catchAsync(async (req, res) => {
  const collection = await collectionService.getCollectionBySlug(req.params.collectionSlug);
  if (!collection) {
    throwException(httpStatus.NOT_FOUND, 'Collection not found');
  }
  res.send(collection);
});

const updateCollection = catchAsync(async (req, res) => {
  const collection = await collectionService.updateCollectionById(req.params.collectionId, req.body);
  res.send(collection);
});

const deleteCollection = catchAsync(async (req, res) => {
  await collectionService.deleteCollectionById(req.params.collectionId);
  res.status(httpStatus.NO_CONTENT).send();
});

const requestVerifyCollection = catchAsync(async (req, res) => {
  const result = await collectionService.requestVerifyCollection(req.body);
  res.status(httpStatus.CREATED).send(result);
});

const isExistCollection = catchAsync(async (req, res) => {
  const result = await collectionService.isExistCollection(req.params.address);
  res.status(httpStatus.CREATED).send(result);
});

module.exports = {
  createCollection,
  getCollections,
  getCollection,
  getCollectionBySlug,
  updateCollection,
  deleteCollection,
  getTrendingCollections,
  requestVerifyCollection,
  isExistCollection,
};
