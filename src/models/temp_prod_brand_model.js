const { Schema, model } = require('mongoose');
const {
  STATUS_PENDING_APR, STATUS_APPROVED, STATUS_REJECTED,
} = require('../constants/status');

const TempProdBrandSchema = new Schema({
  prodCategory: {
    type: Schema.Types.ObjectId,
    ref: 'prod_category',
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
  status: {
    type: String,
    enum: [STATUS_PENDING_APR, STATUS_APPROVED, STATUS_REJECTED],
    default: STATUS_PENDING_APR,
  },
  rejectReason: {
    type: String,
  },
  seller: {
    type: {
      _id: {
        type: Schema.Types.ObjectId,
        required: true,
      },
      email: {
        type: String,
        required: true,
        trim: true,
      },
    },
    required: true,
  },
}, { timestamps: true });

module.exports = model('temp_prod_brand', TempProdBrandSchema);
