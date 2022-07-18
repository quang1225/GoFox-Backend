const httpStatus = require('http-status');
const pick = require('../utils/pick');
const catchAsync = require('../utils/catchAsync');
const { bannerService } = require('../services');
const { throwException } = require('../config/exception');

const createBanner = catchAsync(async (req, res) => {
  const banner = await bannerService.createBanner(req.body);
  res.status(httpStatus.CREATED).send(banner);
});

const getBanners = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['bannerType']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await bannerService.queryBanners(filter, options);
  res.send(result);
});

const getBanner = catchAsync(async (req, res) => {
  const banner = await bannerService.getBannerById(req.params.bannerId);
  if (!banner) {
    throwException(httpStatus.NOT_FOUND, 'Banner not found');
  }
  res.send(banner);
});

const updateBanner = catchAsync(async (req, res) => {
  const banner = await bannerService.updateBannerById(req.params.bannerId, req.body);
  res.send(banner);
});

const deleteBanner = catchAsync(async (req, res) => {
  await bannerService.deleteBannerById(req.params.bannerId);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  createBanner,
  getBanners,
  getBanner,
  updateBanner,
  deleteBanner,
};
