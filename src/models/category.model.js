const mongoose = require('mongoose');
const slugPlugin = require('mongoose-slug-updater');
const { toJSON, paginate } = require('./plugins');
const { DefaultStatus } = require('../utils/constants');

const categorySchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      index: true,
    },
    slug: {
      type: String,
      unique: true,
      slug: 'name',
      index: true,
    },
    parentId: {
      type: String,
      default: '',
    },
    sort: {
      type: Number,
      default: 0,
      index: true,
    },
    status: {
      type: Number,
      default: DefaultStatus.ACTIVE,
      index: true,
    },
    description: {
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
  },
  {
    timestamps: true,
  }
);

categorySchema.plugin(toJSON);
categorySchema.plugin(paginate);
categorySchema.plugin(slugPlugin);

categorySchema.statics.isSlugTaken = async function (slug, excludeCategoryId) {
  const category = await this.findOne({ slug, _id: { $ne: excludeCategoryId } });
  return !!category;
};

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;
