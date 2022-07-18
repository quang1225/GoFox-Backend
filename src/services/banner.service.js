const httpStatus = require('http-status');
const { Banner } = require('../models');
const { throwException } = require('../config/exception');

const createBanner = async (bannerBody) => {
  const _banner = await Banner.create(bannerBody);
  return _banner;
};

const queryBanners = async (filter, options) => {
  const _banners = await Banner.paginate(filter, options);
  return _banners;
};

const getBannerById = async (id) => {
  return Banner.findById(id);
};

const updateBannerById = async (bannerId, updateBody) => {
  const _banner = await getBannerById(bannerId);
  if (!_banner) {
    throwException(httpStatus.NOT_FOUND, 'Banner not found');
  }
  Object.assign(_banner, updateBody);
  await _banner.save();
  return _banner;
};

const deleteBannerById = async (bannerId) => {
  const _banner = await getBannerById(bannerId);
  if (!_banner) {
    throwException(httpStatus.NOT_FOUND, 'Banner not found');
  }
  await _banner.remove();
  return _banner;
};

module.exports = {
  createBanner,
  queryBanners,
  getBannerById,
  updateBannerById,
  deleteBannerById,
};
