const mongoose = require('mongoose');
const idvalidator = require('mongoose-id-validator');
const { toJSON, paginate } = require('./plugins');
const { DefaultStatus } = require('../utils/constants');

const offerListingSchema = mongoose.Schema(
  {
    itemId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'Item',
      required: true,
      index: true,
    },
    price: {
      type: Number,
      required: true,
      index: true,
    },
    salePrice: {
      type: Number,
      default: null,
      index: true,
    },
    offerUserId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    status: {
      type: Number,
      default: DefaultStatus.ACTIVE,
      index: true,
    },
    createdBy: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'User',
    },
    modifiedBy: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

offerListingSchema.plugin(toJSON);
offerListingSchema.plugin(paginate);
offerListingSchema.plugin(idvalidator);

const OfferListing = mongoose.model('OfferListing', offerListingSchema);

module.exports = OfferListing;
