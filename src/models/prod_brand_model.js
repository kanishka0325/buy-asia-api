const { Schema, model } = require('mongoose');
const { STATUS_ACTIVE, STATUS_INACTIVE } = require('../constants/status');

const ProdBrandSchema = new Schema({
  categories: {
    type: [
      {
        type: Schema.Types.ObjectId,
        ref: 'prod_category',
        required: true,
      },
    ],
    validate: (v) => Array.isArray(v) && v.length,
  },
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true,
    uppercase: true,
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

module.exports = model('prod_brand', ProdBrandSchema);
