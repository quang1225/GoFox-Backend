const mongoose = require('mongoose');
const idvalidator = require('mongoose-id-validator');
const slugPlugin = require('mongoose-slug-updater');
const { toJSON, paginate } = require('./plugins');
const { CollectionStatus } = require('../utils/constants');

const collectionSchema = mongoose.Schema(
  {
    contractToken: {
      type: String,
      required: true,
      trim: true,
    },
    userId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'User',
      index: true,
    },
    name: {
      type: String,
      trim: true,
      index: true,
      require: true,
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
      default: '',
    },
    coverImage: {
      type: String,
      trim: true,
      default: '',
    },
    description: {
      type: String,
      default: '',
    },
    networkName: {
      type: String,
      default: '',
      index: true,
    },
    sort: {
      type: Number,
      default: 0,
      index: true,
    },
    flag: {
      type: String,
      default: CollectionStatus.UNVERIFIED, // Only display but not sell
      index: true,
    },
    website: {
      type: String,
      default: '',
    },

    twitter: {
      type: String,
      default: '',
    },

    instagram: {
      type: String,
      default: '',
    },

    telegram: {
      type: String,
      default: '',
    },

    discord: {
      type: String,
      default: '',
    },

    medium: {
      type: String,
      default: '',
    },

    youtube: {
      type: String,
      default: '',
    },
    createdBy: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'User',
    },
    modifiedBy: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'User',
    },
    countItem: {
      type: Number,
      default: 0,
      index: true,
    },
    countActivity: {
      type: Number,
      default: 0,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

collectionSchema.plugin(toJSON);
collectionSchema.plugin(paginate);
collectionSchema.plugin(idvalidator);
collectionSchema.plugin(slugPlugin);

const Collection = mongoose.model('Collection', collectionSchema);

module.exports = Collection;
