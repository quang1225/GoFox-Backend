const mongoose = require('mongoose');
const idvalidator = require('mongoose-id-validator');
const { toJSON, paginate } = require('./plugins');
const { Sort, DefaultStatus } = require('../utils/constants');

const itemListingSchema = mongoose.Schema(
  {
    itemId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'Item',
      required: true,
      index: true,
    },
    tokenId: {
      type: String,
      index: true,
    },
    collectionAddress: {
      type: String,
      index: true,
    },
    owner: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'User',
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
    expireAt: {
      type: Date,
      default: null,
      index: true,
    },
    status: {
      type: Number,
      default: DefaultStatus.DEACTIVE,
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

itemListingSchema.plugin(toJSON);
itemListingSchema.plugin(paginate);
itemListingSchema.plugin(idvalidator);

itemListingSchema.statics.getItemListing = async function (filter) {
  const { tokenId, owner, itemId, price, status = 1 } = filter;
  const token = await this.findOne({ tokenId, owner, itemId, price, status }).sort({ createAt: Sort.DESCENDING });
  return token;
};

const ItemListing = mongoose.model('ItemListing', itemListingSchema);

module.exports = ItemListing;
