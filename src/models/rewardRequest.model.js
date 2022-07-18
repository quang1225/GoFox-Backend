const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');
const { DefaultStatus } = require('../utils/constants');

const rewardRequestSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'User',
      require: true,
    },
    amount: {
      type: Number,
      default: 0,
      index: true,
    },
    transactionId: {
      type: String,
      require: true,
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

rewardRequestSchema.plugin(toJSON);
rewardRequestSchema.plugin(paginate);

const RewardRequest = mongoose.model('RewardRequest', rewardRequestSchema);

module.exports = RewardRequest;
