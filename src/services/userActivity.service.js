const httpStatus = require('http-status');
const { UserActivity } = require('../models');
const { throwException } = require('../config/exception');

const createUserActivity = async (UserActivityBody) => {
  const _userActivity = await UserActivity.create(UserActivityBody);
  return _userActivity;
};
const queryUserActivity = async (filter, options) => {
  const _userActivity = await UserActivity.paginate(filter, options);
  return _userActivity;
};

const getUserActivityById = async (id) => {
  return UserActivity.findById(id);
};

const deleteUserActivityById = async (UserActivityId) => {
  const _userActivity = await getUserActivityById(UserActivityId);
  if (!_userActivity) {
    throwException(httpStatus.NOT_FOUND, 'UserActivity not found');
  }
  await _userActivity.remove();
  return _userActivity;
};

module.exports = {
  createUserActivity,
  queryUserActivity,
  getUserActivityById,
  deleteUserActivityById,
};
