const UserActivityTypes = {
  LOGIN: 'login',
  REGISTER: 'register',
  BUY: 'buy',
  TRANSFER: 'transfer',
  SELL: 'sell',
};

const ItemActivityTypes = {
  LISTING: 'listing',
  TRANSFER: 'transfer',
  MINT: 'mint',
  CANCEL: 'cancel',
  BURN: 'burn',
  OFFER: 'offer',
};

const CollectionStatus = {
  UNVERIFIED: 'UNVERIFIED',
  REQUESTING: 'REQUESTING',
  VERIFIED: 'VERIFIED',
  DISABLED: 'DISABLED',
};

const NetWork = {
  BSC: 'BSC',
  ETH: 'ETH',
};

const DefaultStatus = {
  DEACTIVE: 0,
  ACTIVE: 1,
  OTHER: 2, // Mark as already process but not work, for manual check
};

const ListingStatus = {
  ...DefaultStatus,
  SALED: 3,
  CANCEL: 4,
};

const Sort = {
  ASCENDING: 1,
  DESCENDING: -1,
};

module.exports = {
  UserActivityTypes,
  ItemActivityTypes,
  NetWork,
  Sort,
  DefaultStatus,
  ListingStatus,
  CollectionStatus,
};
