const httpStatus = require('http-status');
const pick = require('../utils/pick');
const catchAsync = require('../utils/catchAsync');
const { userService } = require('../services');

const createUser = catchAsync(async (req, res) => {
  const user = await userService.createUser(req.body);
  res.status(httpStatus.CREATED).send(user);
});

const getUsers = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['name', 'role']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await userService.queryUsers(filter, options);
  res.send(result);
});

const getUser = catchAsync(async (req, res) => {
  const { idWalletUsername } = req.params;
  const user = await userService.getUser(idWalletUsername);
  res.send(user);
});

const updateUser = catchAsync(async (req, res) => {
  const { idWalletUsername } = req.params;
  const updatedUser = await userService.updateUser(idWalletUsername, req.body);
  res.send(updatedUser);
});

const deleteUser = catchAsync(async (req, res) => {
  const { idWalletUsername } = req.params;
  await userService.deleteUser(idWalletUsername);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  createUser,
  getUsers,
  getUser,
  updateUser,
  deleteUser,
};
