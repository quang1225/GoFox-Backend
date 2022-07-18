const express = require('express');
const authRoute = require('./auth.route');
const userRoute = require('./user.route');
const airdropRoute = require('./airdrop.route');
const rewardRoute = require('./reward.route');
const searchRoute = require('./search.route');
const collectionRoute = require('./collection.route');
const itemInCategoryRoute = require('./itemInCategory.route');
const categoryRoute = require('./category.route');
const offerListingRoute = require('./offerListing.route');
const userActivityRoute = require('./userActivity.route');
const itemActivityRoute = require('./itemActivity.route');
const itemRoute = require('./item.route');
const itemListingRoute = require('./itemListing.route');
const itemOwnerRoute = require('./itemOwner.route');
const bannerRoute = require('./banner.route');
const contractRoute = require('./contract.route');
const docsRoute = require('./docs.route');
const logRoute = require('./log.route');
const config = require('../config/config');

const router = express.Router();

const defaultRoutes = [
  {
    path: '/auth',
    route: authRoute,
  },
  {
    path: '/users',
    route: userRoute,
  },
  {
    path: '/search',
    route: searchRoute,
  },
  {
    path: '/collections',
    route: collectionRoute,
  },
  {
    path: '/itemInCategory',
    route: itemInCategoryRoute,
  },
  {
    path: '/items',
    route: itemRoute,
  },
  {
    path: '/owner',
    route: itemOwnerRoute,
  },
  {
    path: '/itemListings',
    route: itemListingRoute,
  },
  {
    path: '/itemActivities',
    route: itemActivityRoute,
  },
  {
    path: '/categories',
    route: categoryRoute,
  },
  {
    path: '/userActivities',
    route: userActivityRoute,
  },
  {
    path: '/offerListings',
    route: offerListingRoute,
  },
  {
    path: '/airdrops',
    route: airdropRoute,
  },
  {
    path: '/rewards',
    route: rewardRoute,
  },
  {
    path: '/banners',
    route: bannerRoute,
  },
  {
    path: '/smart-contract',
    route: contractRoute,
  },
  {
    path: '/logger',
    route: logRoute,
  },
  {
    path: '/docs',
    route: docsRoute,
  },
];

const devRoutes = [
  // routes available only in development mode
  {
    path: '/docs',
    route: docsRoute,
  },
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

/* istanbul ignore next */
if (config.env === 'development') {
  devRoutes.forEach((route) => {
    router.use(route.path, route.route);
  });
}

module.exports = router;
