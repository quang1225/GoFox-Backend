const mongoose = require('mongoose');
const idvalidator = require('mongoose-id-validator');
const validator = require('validator');
const slugPlugin = require('mongoose-slug-updater');
const { DefaultStatus } = require('../utils/constants');
const { toJSON, paginate } = require('./plugins');

const requestVerifyCollectionSchema = mongoose.Schema(
  {
    collectionId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'Collection',
      index: true,
    },
    fullname: {
      type: String,
      trim: true,
      default: '',
    },
    twitter: {
      type: String,
      trim: true,
      default: '',
    },
    facebook: {
      type: String,
      trim: true,
      default: '',
    },
    linkedIn: {
      type: String,
      trim: true,
      default: '',
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: '',
      validate(value) {
        if (value && !validator.isEmail(value)) {
          throw new Error('Invalid email');
        }
      },
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

requestVerifyCollectionSchema.plugin(toJSON);
requestVerifyCollectionSchema.plugin(paginate);
requestVerifyCollectionSchema.plugin(idvalidator);
requestVerifyCollectionSchema.plugin(slugPlugin);

const RequestVerifyCollection = mongoose.model('RequestVerifyCollection', requestVerifyCollectionSchema);

module.exports = RequestVerifyCollection;
