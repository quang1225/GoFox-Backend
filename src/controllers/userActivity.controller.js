const httpStatus = require('http-status');
const pick = require('../utils/pick');
const catchAsync = require('../utils/catchAsync');
const { userActivityService, userService } = require('../services');
const { throwException } = require('../config/exception');

const createUserActivity = catchAsync(async (req, res) => {
  const user = await userService.getUserById(req.body.userId);
  if (!user) {
    throwException(httpStatus.NOT_FOUND, `Not found User with userId: ${req.body.userId}`);
  }
  const userActivity = await userActivityService.createUserActivity(req.body);
  res.status(httpStatus.CREATED).send(userActivity);
});

const getUserActivities = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['name']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await userActivityService.queryUserActivity(filter, options);
  res.send(result);
});

const getUserActivity = catchAsync(async (req, res) => {
  const userActivity = await userActivityService.getUserActivityById(req.params.userActivityId);
  if (!userActivity) {
    throwException(httpStatus.NOT_FOUND, 'UserActivity not found');
  }
  res.send(userActivity);
});

const deleteUserActivity = catchAsync(async (req, res) => {
  await userActivityService.deleteUserActivityById(req.params.userActivityId);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  createUserActivity,
  getUserActivities,
  getUserActivity,
  deleteUserActivity,
};
