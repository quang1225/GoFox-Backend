const mongoose = require('mongoose');
const idvalidator = require('mongoose-id-validator');
const { toJSON, paginate } = require('./plugins');
const { UserActivityTypes } = require('../utils/constants');

const userActivitySchema = mongoose.Schema(
  {
    LogType: {
      type: String,
      required: true,
      enum: Object.values(UserActivityTypes),
      index: true,
    },
    userId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    device: {
      type: String,
      default: '',
    },
    ipAddress: {
      type: String,
      trim: true,
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
  },
  {
    timestamps: true,
  }
);

userActivitySchema.plugin(toJSON);
userActivitySchema.plugin(paginate);
userActivitySchema.plugin(idvalidator);

const UserActivity = mongoose.model('UserActivity', userActivitySchema);

module.exports = UserActivity;
