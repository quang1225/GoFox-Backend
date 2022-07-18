const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createCategory = {
  body: Joi.object().keys({
    name: Joi.string().required(),
  }),
};

const getCategories = {
  query: Joi.object().keys({
    name: Joi.string(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getCategorieItems = {
  query: Joi.object().keys({}),
};

const getCategory = {
  params: Joi.object().keys({
    categoryId: Joi.string().custom(objectId),
  }),
};

const updateCategory = {
  params: Joi.object().keys({ categoryId: Joi.string().custom(objectId) }),
  body: Joi.object()
    .keys({
      name: Joi.string().required(),
      parentId: Joi.string().allow(''),
      collections: Joi.array().items(Joi.string().custom(objectId)),
      sort: Joi.number(),
      status: Joi.number(),
      description: Joi.string().allow(''),
    })
    .min(1),
};

const deleteCategory = {
  params: Joi.object().keys({
    categoryId: Joi.string().custom(objectId),
  }),
};

module.exports = {
  createCategory,
  getCategories,
  getCategory,
  updateCategory,
  deleteCategory,
  getCategorieItems,
};
