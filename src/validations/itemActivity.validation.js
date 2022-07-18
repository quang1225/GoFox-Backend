const Joi = require('joi');
const { objectId } = require('./custom.validation');

const getItemActivity = {
  query: Joi.object().keys({
    historyType: Joi.string(),
    itemId: Joi.custom(objectId),
    fromUserId: Joi.custom(objectId),
    toUserId: Joi.custom(objectId),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

module.exports = {
  getItemActivity,
};
