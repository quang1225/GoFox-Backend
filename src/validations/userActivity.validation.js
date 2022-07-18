const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createUserActivity = {
  body: Joi.object().keys({
    userId: Joi.required().custom(objectId),
    LogType: Joi.string().required(),
    device: Joi.string(),
    ipAddress: Joi.string(),
  }),
};

const getUserActivities = {
  query: Joi.object().keys({
    LogType: Joi.string(),
    device: Joi.string(),
    ipAddress: Joi.string(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getUserActivity = {
  params: Joi.object().keys({
    userActivityId: Joi.required().custom(objectId),
  }),
};

const deleteUserActivity = {
  params: Joi.object().keys({
    userActivityId: Joi.required().custom(objectId),
  }),
};

module.exports = {
  createUserActivity,
  getUserActivities,
  getUserActivity,
  deleteUserActivity,
};
