const pick = require('../utils/pick');
const catchAsync = require('../utils/catchAsync');
const { searchService } = require('../services');

const searchHeader = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['name']);
  const { name } = filter;
  const result = await searchService.searchHeader(name);
  res.send(result);
});

module.exports = {
  searchHeader,
};
