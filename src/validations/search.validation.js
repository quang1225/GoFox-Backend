const Joi = require('joi');

const searchHeader = {
  query: Joi.object().keys({
    name: Joi.string().required(),
  }),
};

module.exports = {
  searchHeader,
};
