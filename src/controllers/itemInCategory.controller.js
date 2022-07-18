const httpStatus = require('http-status');
const pick = require('../utils/pick');
const catchAsync = require('../utils/catchAsync');
const { itemInCategoryService, categoryService, itemService } = require('../services');
const { throwException } = require('../config/exception');

const createItemInCategory = catchAsync(async (req, res) => {
  const _item = await itemService.getItemById(req.body.itemId);
  if (!_item) {
    throwException(httpStatus.NOT_FOUND, `Not found _item with itemId: ${req.body.itemId}`);
  }
  const category = await categoryService.getCategoryById(req.body.categoryId);
  if (!category) {
    throwException(httpStatus.NOT_FOUND, `Not found category with categoryId: ${req.body.itemId}`);
  }
  const itemincategory = await itemInCategoryService.createItemInCategory(req.body);
  res.status(httpStatus.CREATED).send(itemincategory);
});

const getItemInCategorys = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['name']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await itemInCategoryService.queryItemInCategory(filter, options);
  res.send(result);
});

const getItemInCategory = catchAsync(async (req, res) => {
  const itemincategory = await itemInCategoryService.getItemInCategoryById(req.params.itemincategoryId);
  if (!itemincategory) {
    throwException(httpStatus.NOT_FOUND, 'ItemInCategory not found');
  }
  res.send(itemincategory);
});

const updateItemInCategory = catchAsync(async (req, res) => {
  const _item = await itemService.getItemById(req.body.itemId);
  if (!_item) {
    throwException(httpStatus.NOT_FOUND, `Not found _item with itemId: ${req.body.itemId}`);
  }
  const category = await categoryService.getCategoryById(req.body.categoryId);
  if (!category) {
    throwException(httpStatus.NOT_FOUND, `Not found category with categoryId: ${req.body.itemId}`);
  }
  const itemincategory = await itemInCategoryService.updateItemInCategoryById(req.params.itemincategoryId, req.body);
  res.send(itemincategory);
});

const deleteItemInCategory = catchAsync(async (req, res) => {
  await itemInCategoryService.deleteItemInCategoryById(req.params.itemincategoryId);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  createItemInCategory,
  getItemInCategorys,
  getItemInCategory,
  updateItemInCategory,
  deleteItemInCategory,
};
