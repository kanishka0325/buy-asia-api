const { Schema, model } = require('mongoose');
const { STATUS_ACTIVE, STATUS_INACTIVE } = require('../constants/status');

const ProdCategorySchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  imageUrl: {
    type: String,
    required: true,
    trim: true,
  },
  status: {
    type: String,
    trim: true,
    default: STATUS_ACTIVE,
    enum: [STATUS_INACTIVE, STATUS_ACTIVE],
  },
}, { timestamps: true });

module.exports = model('prod_category', ProdCategorySchema);
