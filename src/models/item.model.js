const mongoose = require('mongoose');
const idvalidator = require('mongoose-id-validator');
const slugPlugin = require('mongoose-slug-updater');
const { toJSON, paginate } = require('./plugins');
const { DefaultStatus } = require('../utils/constants');

const Property = new mongoose.Schema({
  typeName: {
    type: String,
  },
  value: {
    type: String,
    default: '',
  },
  sort: {
    type: Number,
    default: 0,
  },
});

const itemSchema = mongoose.Schema(
  {
    transactionId: {
      type: String,
      trim: true,
      index: true,
    },
    collectionId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'Collection',
      required: true,
    },
    name: {
      type: String,
      trim: true,
      index: true,
    },
    slug: {
      type: String,
      unique: true,
      slug: 'name',
      index: true,
    },
    avatar: {
      type: String,
      trim: true,
    },
    itemType: {
      type: String,
      trim: true,
      index: true,
    },
    creator: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    properties: {
      type: [Property],
      default: [],
    },
    favorites: {
      type: [
        {
          type: mongoose.SchemaTypes.ObjectId,
          ref: 'User',
        },
      ],
      default: [],
    },
    description: {
      type: String,
    },
    status: {
      type: Number,
      default: DefaultStatus.DEACTIVE,
      index: true,
    },
    viewed: {
      type: Number,
      default: 0,
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

// add plugin that converts mongoose to json
itemSchema.plugin(toJSON);
itemSchema.plugin(paginate);
itemSchema.plugin(idvalidator);
itemSchema.plugin(slugPlugin);

itemSchema.statics.getExistItem = async function (name, avatar, collectionId) {
  const token = await this.findOne({ name, avatar, collectionId });
  return token;
};

const Item = mongoose.model('Item', itemSchema);

module.exports = Item;
