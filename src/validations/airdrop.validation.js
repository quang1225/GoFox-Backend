const Joi = require('joi');

const validateAirDrop = {
  params: Joi.object().keys({
    walletAddress: Joi.string(),
  }),
};

const distributeAirDrop = {};

const updateClaimAirDropFilter = {
  params: Joi.object().keys({
    walletAddress: Joi.required(),
  }),
};

const generateSignature = {
  body: Joi.object().keys({
    reciept: Joi.string(),
    amount: Joi.number(),
  }),
};

module.exports = {
  distributeAirDrop,
  validateAirDrop,
  updateClaimAirDropFilter,
  generateSignature,
};
