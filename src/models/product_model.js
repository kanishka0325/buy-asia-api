const { Schema, model } = require('mongoose');
const { STATUS_ACTIVE, STATUS_INACTIVE } = require('../constants/status');

const ProductSchema = new Schema({
  code: {
    type: String,
    required: true,
    trim: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  seller: {
    type: Schema.Types.ObjectId,
    ref: 'seller',
    required: true,
  },
  prodCategory: {
    type: Schema.Types.ObjectId,
    ref: 'prod_category',
    required: true,
  },
  prodSubCategory: {
    type: Schema.Types.ObjectId,
    ref: 'prod_sub_category',
    required: true,
  },
  prodGroup: {
    type: Schema.Types.ObjectId,
    ref: 'prod_group',
    required: true,
  },
  prodBrand: {
    type: Schema.Types.ObjectId,
    ref: 'prod_brand',
    required: true,
  },
  desc: {
    type: String,
    trim: true,
    required: true,
  },
  discountPercent: {
    type: Number,
    min: 0,
    max: 100,
    default: 0,
  },
  shipmentPrice: {
    type: Number,
    min: 0,
    default: 0,
  },
  variantCombos: {
    type: [
      {
        variantCombo: {
          type: [
            {
              variant: {
                type: String,
                trim: true,
                required: true,
              },
              value: {
                type: String,
                trim: true,
                required: true,
              },
            },
          ],
          validate: (v) => Array.isArray(v),
        },
        price: {
          type: Number,
          required: true,
          validate: (v) => v > 0,
        },
        qty: {
          type: Number,
          min: 0,
          required: true,
        },
      },
    ],
    validate: (v) => Array.isArray(v) && v.length,
  },
  imageUrls: {
    type: [
      {
        type: String,
        trim: true,
        required: true,
      },
    ],
    validate: (v) => Array.isArray(v) && v.length,
  },
  videoUrl: {
    type: String,
    trim: true,
  },
  specs: {
    type: [
      {
        title: {
          type: String,
          trim: true,
          required: true,
        },
        keyValPairs: {
          type: [
            {
              key: {
                type: String,
                trim: true,
                required: true,
              },
              value: {
                type: String,
                trim: true,
                required: true,
              },
            },
          ],
          validate: (v) => Array.isArray(v) && v.length,
        },
      },
    ],
    validate: (v) => Array.isArray(v) && v.length,
  },
  totalRating: {
    type: Number,
    default: 0,
  },
  totalRaters: {
    type: Number,
    default: 0,
  },
  avgRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
  },
  status: {
    type: String,
    trim: true,
    default: STATUS_ACTIVE,
    enum: [STATUS_INACTIVE, STATUS_ACTIVE],
  },

}, { timestamps: true });

module.exports = model('product', ProductSchema);
