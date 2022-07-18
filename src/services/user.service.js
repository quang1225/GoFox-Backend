const httpStatus = require('http-status');
const mongoose = require('mongoose');
const { User } = require('../models');
const { throwException } = require('../config/exception');

const getUserByUsername = async (username) => {
  return User.findOne({ username });
};

const getUserByAddressId = async (id) => {
  return User.findOne({ walletAddress: id });
};

const getUserByEmail = async (email) => {
  return User.findOne({ email });
};

const getUserById = async (id) => {
  return User.findById(id);
};

const createUser = async (userBody) => {
  if (await User.isWalletAddressTaken(userBody.walletAddress)) {
    throwException(httpStatus.BAD_REQUEST, 'Wallet Address already taken');
  }
  if (await User.isEmailTaken(userBody.email)) {
    throwException(httpStatus.BAD_REQUEST, 'Email already taken');
  }
  const _user = await User.create(userBody);
  return _user;
};

const queryUsers = async (filter, options) => {
  const _user = await User.paginate(filter, options);
  return _user;
};

const getUserOrCreate = async (address) => {
  const walletAddress = address.toLowerCase();
  const _user = await getUserByAddressId(walletAddress);
  if (_user) {
    return _user;
  }

  const body = {
    walletAddress,
    username: walletAddress,
  };
  const _newUser = await createUser(body);
  return _newUser;
};

const getUser = async (idWalletUsername) => {
  let user;
  if (idWalletUsername.startsWith('0x')) {
    user = await getUserByAddressId(idWalletUsername);
  } else if (
    mongoose.isValidObjectId(idWalletUsername) ||
    idWalletUsername.length === 12 ||
    idWalletUsername.length === 24
  ) {
    user = await getUserById(idWalletUsername);
    if (!user) {
      user = await getUserByUsername(idWalletUsername);
      if (!user) {
        throwException(httpStatus.NOT_FOUND, 'User not found');
      }
    }
  } else {
    user = await getUserByUsername(idWalletUsername);
  }
  return user;
};

const updateUser = async (id, updateBody) => {
  const _user = await getUser(id);
  if (updateBody.email && (await User.isEmailTaken(updateBody.email, _user._id))) {
    return 'Email already taken!';
    // throwException(httpStatus.BAD_REQUEST, 'Email already taken');
  }
  if (updateBody.username && (await User.isUsernameTaken(updateBody.username, _user._id))) {
    return 'Username already taken!';
  }
  Object.assign(_user, updateBody);
  await _user.save();
  return _user;
};

const deleteUser = async (id) => {
  const _user = await getUser(id);
  await _user.remove();
  return _user;
};

module.exports = {
  createUser,
  queryUsers,
  getUserById,
  getUserByUsername,
  getUserByEmail,
  getUser,
  updateUser,
  deleteUser,
  getUserByAddressId,
  getUserOrCreate,
};
