const httpStatus = require('http-status');
const { ItemInCategory } = require('../models');
const { throwException } = require('../config/exception');

const createItemInCategory = async (ItemInCategoryBody) => {
  const _collInCategory = await ItemInCategory.create(ItemInCategoryBody);
  return _collInCategory;
};
const insertManyItemInCategory = async (ListItemInCategoryBody) => {
  const _collInCategory = await ItemInCategory.insertMany(ListItemInCategoryBody);
  return _collInCategory;
};
const queryItemInCategory = async (filter, options) => {
  const _collInCategory = await ItemInCategory.paginate(filter, options);
  return _collInCategory;
};

const getItemInCategoryById = async (id) => {
  return ItemInCategory.findById(id);
};

const updateItemInCategoryById = async (ItemInCategoryId, updateBody) => {
  const _collInCategory = await getItemInCategoryById(ItemInCategoryId);
  if (!_collInCategory) {
    throwException(httpStatus.NOT_FOUND, 'ItemInCategory not found');
  }
  Object.assign(_collInCategory, updateBody);
  await _collInCategory.save();
  return _collInCategory;
};

const deleteItemInCategoryById = async (ItemInCategoryId) => {
  const _collInCategory = await getItemInCategoryById(ItemInCategoryId);
  if (!_collInCategory) {
    throwException(httpStatus.NOT_FOUND, 'ItemInCategory not found');
  }
  await _collInCategory.remove();
  return _collInCategory;
};

module.exports = {
  createItemInCategory,
  queryItemInCategory,
  getItemInCategoryById,
  updateItemInCategoryById,
  deleteItemInCategoryById,
  insertManyItemInCategory,
};
