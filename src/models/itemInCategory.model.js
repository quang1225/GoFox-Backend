const mongoose = require('mongoose');
const idvalidator = require('mongoose-id-validator');
const { toJSON, paginate } = require('./plugins');

const itemInCategorySchema = mongoose.Schema(
  {
    categoryId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'Category',
      required: true,
      index: true,
    },
    itemId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'Item',
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

itemInCategorySchema.plugin(toJSON);
itemInCategorySchema.plugin(paginate);
itemInCategorySchema.plugin(idvalidator);

const ItemInCategory = mongoose.model('ItemInCategory', itemInCategorySchema);

module.exports = ItemInCategory;
