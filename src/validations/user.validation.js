const Joi = require('joi');
// const { password, objectId } = require('./custom.validation');

const createUser = {
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    // password: Joi.string().required().custom(password),
    password: Joi.string().required(),
    fullname: Joi.string(),
    walletAddress: Joi.string().required(),
    // role: Joi.string().required().valid('user', 'admin'),
  }),
};

const getUsers = {
  query: Joi.object().keys({
    fullname: Joi.string(),
    role: Joi.string(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getUser = {
  params: Joi.object().keys({
    idWalletUsername: Joi.string().required(),
  }),
};

const updateUser = {
  params: Joi.object().keys({
    idWalletUsername: Joi.string().required(),
  }),
  body: Joi.object()
    .keys({
      email: Joi.string().email().allow(''),
      // password: Joi.string().custom(password),
      password: Joi.string(),
      fullname: Joi.string(),
      bio: Joi.string().allow(''),
      avatar: Joi.string().allow(''),
      coverImg: Joi.string().allow(''),
      createdAt: Joi.date(),
      username: Joi.string().allow(''),
    })
    .min(1),
};

const deleteUser = {
  params: Joi.object().keys({
    idWalletUsername: Joi.string().required(),
  }),
};

module.exports = {
  createUser,
  getUsers,
  getUser,
  updateUser,
  deleteUser,
};
