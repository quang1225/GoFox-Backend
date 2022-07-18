const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createBanner = {
  body: Joi.object().keys({
    title: Joi.string(),
    bannerType: Joi.string(),
    image: Joi.string(),
    status: Joi.string(),
    dateFrom: Joi.date(),
    dateTo: Joi.date(),
    order: Joi.number(),
  }),
};

const getBanners = {
  query: Joi.object().keys({
    bannerType: Joi.string(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getBanner = {
  params: Joi.object().keys({
    bannerId: Joi.string().custom(objectId),
  }),
};

const updateBanner = {
  params: Joi.object().keys({
    bannerId: Joi.required().custom(objectId),
  }),
};

const deleteBanner = {
  params: Joi.object().keys({
    bannerId: Joi.string().custom(objectId),
  }),
};

module.exports = {
  createBanner,
  getBanners,
  getBanner,
  updateBanner,
  deleteBanner,
};
