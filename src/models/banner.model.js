const mongoose = require('mongoose');
const idvalidator = require('mongoose-id-validator');
const { toJSON, paginate } = require('./plugins');
const { DefaultStatus } = require('../utils/constants');

const bannerSchema = mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
      index: true,
    },
    bannerType: {
      type: String,
      trim: true,
      index: true,
    },
    description: {
      type: String,
    },
    image: {
      type: String,
      trim: true,
      require: true,
    },
    url: {
      type: String,
      trim: true,
    },
    status: {
      default: DefaultStatus.ACTIVE,
      type: String,
      index: true,
    },
    dateFrom: {
      type: Date,
    },
    dateTo: {
      type: Date,
    },
    order: {
      type: Number,
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
bannerSchema.plugin(toJSON);
bannerSchema.plugin(paginate);
bannerSchema.plugin(idvalidator);

const Banner = mongoose.model('Banner', bannerSchema);

module.exports = Banner;
