const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');
const { DefaultStatus } = require('../utils/constants');

const airdropSchema = mongoose.Schema(
  {
    walletAddress: {
      type: String,
      unique: true,
      require: true,
      index: true,
    },
    status: {
      type: Number,
      default: DefaultStatus.ACTIVE,
      index: true,
    },
    amount: {
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

airdropSchema.plugin(toJSON);
airdropSchema.plugin(paginate);

airdropSchema.statics.getAirDrop = async function (walletAddress) {
  const address = await this.findOne({
    walletAddress: { $regex: walletAddress, $options: '-i' },
  });
  return address;
};

const AirDrop = mongoose.model('AirDrop', airdropSchema);

module.exports = AirDrop;
