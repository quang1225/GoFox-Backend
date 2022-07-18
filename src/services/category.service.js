const httpStatus = require('http-status');
const { Category, Item } = require('../models');
const { defaultJoinItem, joinItemCategory, selectItemDetail } = require('./item.service');
const { DefaultStatus } = require('../utils/constants');
const { throwException } = require('../config/exception');

const createCategory = async (categoryBody) => {
  const _category = await Category.create(categoryBody);
  return _category;
};

const queryCategory = async (filter, options, select = '') => {
  const _category = await Category.paginate(filter, options, select);
  return _category;
};

const getCategorieItems = async () => {
  let pipeline = [
    { $match: { status: DefaultStatus.ACTIVE } },
    {
      $project: {
        _id: 0,
        i: '$$ROOT',
      },
    },
  ];

  pipeline = pipeline.concat(defaultJoinItem(true));
  pipeline = pipeline.concat(joinItemCategory);

  pipeline = pipeline.concat([
    {
      $match: { 'cate.status': 1 },
    },
    {
      $group: {
        _id: '$cate',
        items: {
          $push: selectItemDetail,
        },
      },
    },
    {
      $project: {
        _id: 0,
        categoryId: '$_id._id',
        categoryName: '$_id.name',
        categorySlug: '$_id.slug',
        categorySort: '$_id.sort',
        items: { $slice: ['$items', 12] },
      },
    },
    { $sort: { categorySort: 1 } },
  ]);

  const _categories = Item.aggregate(pipeline);

  return _categories;
};

const getCategoryById = async (id) => {
  return Category.findById(id);
};

const updateCategoryById = async (CategoryId, updateBody) => {
  const _category = await getCategoryById(CategoryId);
  if (!_category) {
    throwException(httpStatus.NOT_FOUND, 'Category not found');
  }
  Object.assign(_category, updateBody);
  await _category.save();
  return _category;
};

const deleteCategoryById = async (CategoryId) => {
  const _category = await getCategoryById(CategoryId);
  if (!_category) {
    throwException(httpStatus.NOT_FOUND, 'Category not found');
  }
  await _category.remove();
  return _category;
};

module.exports = {
  createCategory,
  queryCategory,
  getCategoryById,
  updateCategoryById,
  deleteCategoryById,
  getCategorieItems,
};
