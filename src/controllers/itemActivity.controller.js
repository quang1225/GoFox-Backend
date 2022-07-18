const pick = require('../utils/pick');
const catchAsync = require('../utils/catchAsync');
const { itemActivityService } = require('../services');

const getItemActivity = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['historyType', 'itemId', 'fromUserId', 'toUserId']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await itemActivityService.queryItemActivity(filter, options);
  res.send(result);
});

module.exports = {
  getItemActivity,
};
