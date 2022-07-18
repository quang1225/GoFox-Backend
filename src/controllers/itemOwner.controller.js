const catchAsync = require('../utils/catchAsync');
const { itemOwnerService } = require('../services');

const getOwnerItems = catchAsync(async (req, res) => {
  const _ownerItem = await itemOwnerService.getOwnerItems(req.params.ownerId);
  if (!_ownerItem || _ownerItem.length === 0) {
    res.send([]);
  }
  res.send(_ownerItem);
});

const updateItemOwner = catchAsync(async (req, res) => {
  const result = await itemOwnerService.updateItemOwner(req.body);
  res.send(result);
});

module.exports = {
  getOwnerItems,
  updateItemOwner,
};
