const httpStatus = require('http-status');
const pick = require('../utils/pick');
const catchAsync = require('../utils/catchAsync');
const { itemService, itemOwnerService, itemInCategoryService } = require('../services');
const { throwException } = require('../config/exception');
const { cacheRequest } = require('../utils/cacheExtension');

const createItem = catchAsync(async (req, res) => {
  try {
    const data = { ...req.body };
    const categoryIds = data.categoryIds;
    delete data.categoryIds;

    const _item = await itemService.createItem(data);
    if (!_item) throwException(httpStatus.INTERNAL_SERVER_ERROR, 'Create item error !');

    // map Categories
    const createMap = categoryIds.map(function (x) {
      return {
        categoryId: x,
        itemId: _item._id,
      };
    });
    const _map = await itemInCategoryService.insertManyItemInCategory(createMap);
    if (!_map) throwException(httpStatus.INTERNAL_SERVER_ERROR, 'Map categories error !');

    res.status(httpStatus.CREATED).send(_item);
  } catch (error) {
    throwException(httpStatus.INTERNAL_SERVER_ERROR, `${error}`);
  }
});

const createConfirm = catchAsync(async (req, res) => {
  const _item = await itemService.createConfirm(req.body);
  if (!_item) throwException(httpStatus.INTERNAL_SERVER_ERROR, 'Mint confirm error');
  res.status(httpStatus.OK).send(_item);
});

const createItems = catchAsync(async (req, res) => {
  const { items } = req.body;

  const exceptItems = await itemService.createItems(items);
  res.status(httpStatus.CREATED).send({
    exceptItems,
  });
});

const getItems = catchAsync(
  cacheRequest(async (req, res) => {
    const filter = pick(req.query, [
      'name',
      'tokenIds',
      'userId',
      'categorySlugs',
      'collectionSlugs',
      'priceMin',
      'priceMax',
    ]);
    const options = pick(req.query, ['sortBy', 'limit', 'page', 'sortBy']);
    const result = await itemService.queryItemsWithDetails(filter, options);
    res.send(result);

    // temp return data to cache
    return result;
  })
);

const getItem = catchAsync(async (req, res) => {
  const item = await itemService.getItemById(req.params.itemId);
  if (!item) {
    throwException(httpStatus.NOT_FOUND, 'Item not found');
  }
  res.send(item);
});

const getItemBySlug = catchAsync(async (req, res) => {
  const item = await itemService.getItemBySlugDetails(req.params.itemSlug);
  if (!item) {
    throwException(httpStatus.NOT_FOUND, 'Item not found');
  }
  res.send(item);
});

const updateItem = catchAsync(async (req, res) => {
  const item = await itemService.updateItemById(req.params.itemId, req.body);
  res.send(item);
});

const deleteItem = catchAsync(async (req, res) => {
  await itemService.deleteItemById(req.params.itemId);
  res.status(httpStatus.NO_CONTENT).send();
});

const requestTransferItem = catchAsync(async (req, res) => {
  const filter = req.body;
  const { itemId } = req.body;
  if (!(await itemService.getItemById(itemId))) {
    throwException(httpStatus.NOT_FOUND, 'Item not found');
  }

  if (!(await itemOwnerService.requestTransferItem(filter))) {
    throwException(httpStatus.INTERNAL_SERVER_ERROR, 'Request transfer is failed');
  }

  res.status(httpStatus.CREATED).send();
});

const confirmTransferItem = catchAsync(async (req, res) => {
  const filter = req.body;
  const { itemId } = req.body;
  if (!(await itemService.getItemById(itemId))) {
    throwException(httpStatus.NOT_FOUND, 'Item not found');
  }

  if (!(await itemOwnerService.confirmTransferItem(filter))) {
    throwException(httpStatus.INTERNAL_SERVER_ERROR, 'Transfer is failed');
  }

  res.status(httpStatus.CREATED).send();
});

const favoriteItem = catchAsync(async (req, res) => {
  try {
    const { userId, itemSlug } = req.body;
    const rs = await itemService.favoriteItemBySlug(itemSlug, userId);
    res.send(rs);
  } catch (error) {
    throwException(httpStatus.INTERNAL_SERVER_ERROR, `${error}`);
  }
});

const signatureTransferItem = catchAsync(async (req, res) => {
  const { collectionAddress, ownerAddress, ownerId, itemId, tokenId } = req.body;
  const signature = await itemService.generateSignature(collectionAddress, ownerAddress, ownerId, itemId, tokenId);
  res.send(signature);
});

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
  favoriteItem,
  signatureTransferItem,
};
