const { Schema, model } = require('mongoose');
const { STATUS_ACTIVE, STATUS_INACTIVE } = require('../constants/status');

const ProdGroupSchema = new Schema({
  prodSubCategory: {
    type: Schema.Types.ObjectId,
    ref: 'prod_sub_category',
    required: true,
  },
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
  aot: {
    type: Boolean,
    required: true,
    // default: false,
  },
  status: {
    type: String,
    trim: true,
    default: STATUS_ACTIVE,
    enum: [STATUS_INACTIVE, STATUS_ACTIVE],
  },
}, { timestamps: true });

module.exports = model('prod_group', ProdGroupSchema);
