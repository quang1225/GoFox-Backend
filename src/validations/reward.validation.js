const Joi = require('joi');
const { objectId } = require('./custom.validation');

const claimReward = {
  body: Joi.object().keys({
    transactionId: Joi.string(),
    userId: Joi.required().custom(objectId),
  }),
};

const getReward = {
  param: Joi.object().keys({
    userId: Joi.required().custom(objectId),
  }),
};

const generateSignature = {
  body: Joi.object().keys({
    userId: Joi.required().custom(objectId),
  }),
};

module.exports = {
  getReward,
  claimReward,
  generateSignature,
};
