const Joi = require('joi');

const updateConfirmData = {
  query: Joi.object().keys({
    data: Joi.array(),
    token: Joi.string().allow(''), // Temp put token authorized here
  }),
};

const dynamicCallContract = {
  query: Joi.object().keys({
    token: Joi.string().allow(''), // Temp put token authorized here
  }),
  body: Joi.object().keys({
    abi: Joi.string(),
    address: Joi.string(),
    method: Joi.string(),
    params: Joi.array(),
    token: Joi.string().allow(''), // Temp put token authorized here
  }),
};

const dynamicSendContract = {
  query: Joi.object().keys({
    token: Joi.string().allow(''), // Temp put token authorized here
  }),
  body: Joi.object().keys({
    signedData: Joi.string(),
    token: Joi.string().allow(''), // Temp put token authorized here
  }),
};

module.exports = {
  updateConfirmData,
  dynamicCallContract,
  dynamicSendContract,
};
