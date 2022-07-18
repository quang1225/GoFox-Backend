const mongoose = require('mongoose');
const idvalidator = require('mongoose-id-validator');
const { toJSON, paginate } = require('./plugins');
const { ItemActivityTypes, DefaultStatus } = require('../utils/constants');

const itemActivitySchema = mongoose.Schema(
  {
    historyType: {
      type: String,
      required: true,
      enum: Object.values(ItemActivityTypes),
      index: true,
      default: ItemActivityTypes.LISTING,
    },
    tokenId: {
      type: String,
      required: true,
    },
    collectionAddress: {
      type: String,
      required: true,
    },
    itemId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'Item',
      required: true,
    },
    fromUserId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'User',
      required: true,
    },
    toUserId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'User',
      required: true,
    },
    collectionId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'Collection',
      required: false,
    },
    price: {
      type: Number,
      default: 0,
      index: true,
    },
    total: {
      type: Number,
      default: 1,
    },
    transactionId: {
      type: String,
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

itemActivitySchema.plugin(toJSON);
itemActivitySchema.plugin(paginate);
itemActivitySchema.plugin(idvalidator);

const ItemActivity = mongoose.model('ItemActivity', itemActivitySchema);

module.exports = ItemActivity;
