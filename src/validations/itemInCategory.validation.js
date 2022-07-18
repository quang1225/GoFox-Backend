const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createItemInCategory = {
  body: Joi.object().keys({ categoryId: Joi.required().custom(objectId), itemId: Joi.required().custom(objectId) }),
};

const getItemInCategorys = {
  query: Joi.object().keys({
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getItemInCategory = {
  params: Joi.object().keys({
    itemincategoryId: Joi.required().custom(objectId),
  }),
};

const updateItemInCategory = {
  params: Joi.object().keys({
    itemincategoryId: Joi.required().custom(objectId),
  }),
  body: Joi.object()
    .keys({
      sort: Joi.number(),
    })
    .min(1),
};

const deleteItemInCategory = {
  params: Joi.object().keys({
    itemincategoryId: Joi.required().custom(objectId),
  }),
};

module.exports = {
  createItemInCategory,
  getItemInCategorys,
  getItemInCategory,
  updateItemInCategory,
  deleteItemInCategory,
};
