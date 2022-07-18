const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const History = mongoose.Schema({
  activity: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'ItemActivity',
    require: true,
  },
  amount: {
    type: Number,
    default: 0,
    require: true,
  },
  dateTime: {
    type: Date,
    require: true,
  },
});

const rewardSchema = mongoose.Schema(
  {
    activities: {
      type: [History],
      default: [],
      require: true,
    },
    userId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'User',
      require: true,
    },
    claimableToken: {
      type: Number,
      default: 0,
      index: true,
    },
    totalClaim: {
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

rewardSchema.plugin(toJSON);
rewardSchema.plugin(paginate);

rewardSchema.statics.getReward = async function (userId) {
  const address = await this.findOne({ userId });
  return address;
};

const Reward = mongoose.model('Reward', rewardSchema);

module.exports = Reward;
