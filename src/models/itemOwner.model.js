const mongoose = require('mongoose');
const idvalidator = require('mongoose-id-validator');
const { toJSON, paginate } = require('./plugins');

const itemOwnerSchema = mongoose.Schema(
  {
    tokenIds: {
      type: [
        {
          type: String,
        },
      ],
      default: [],
    },
    itemId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'Item',
      required: true,
      index: true,
    },
    owner: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    networkName: {
      type: String,
      trim: true,
      index: true,
    },
    supply: {
      type: Number,
      min: 0,
    },
    createdAt: {
      type: Date,
      index: true,
      default: Date.now,
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

// add plugin that converts mongoose to json
itemOwnerSchema.plugin(toJSON);
itemOwnerSchema.plugin(paginate);
itemOwnerSchema.plugin(idvalidator);

itemOwnerSchema.statics.getItemOwner = async function (owner, itemId, total = 0) {
  // const token = await this.findOne({ owner, itemId, supply: { $gte: total } });
  const token = await this.findOne({ owner, itemId, $expr: { $gte: [{ $size: '$tokenIds' }, total] } });
  return token;
};

itemOwnerSchema.statics.getItemToken = async function (owner, tokenId, total = 0) {
  const token = await this.findOne({
    owner,
    supply: { $gte: total },
    tokenIds: { $elemMatch: { $in: [tokenId] } },
  });
  return token;
};

const ItemOwner = mongoose.model('ItemOwner', itemOwnerSchema);

module.exports = ItemOwner;
