const { Schema, model } = require('mongoose');
const {
  STATUS_ACTIVE, STATUS_INACTIVE, STATUS_INITIATED, STATUS_OTP_VR,
} = require('../constants/status');

const BuyerSchema = new Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  mobile: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  email: {
    type: String,
    unique: true,
    sparse: true,
    index: true,
    lowercase: true,
    trim: true,
  },
  firstName: {
    type: String,
    trim: true,
  },
  lastName: {
    type: String,
    trim: true,
  },
  contactMobile: {
    type: String,
    trim: true,
  },
  password: {
    type: String,
    trim: true,
  },
  address: {
    billingAdd: {
      addLine1: {
        type: String,
        trim: true,
      },
      addLine2: {
        type: String,
        trim: true,
      },
      city: {
        type: String,
        trim: true,
      },
      district: {
        type: String,
        trim: true,
      },
      zip: {
        type: String,
        trim: true,
      },
      country: {
        type: String,
        trim: true,
      },
    },
    shippingAdd: {
      addLine1: {
        type: String,
        trim: true,
      },
      addLine2: {
        type: String,
        trim: true,
      },
      city: {
        type: String,
        trim: true,
      },
      district: {
        type: String,
        trim: true,
      },
      zip: {
        type: String,
        trim: true,
      },
      country: {
        type: String,
        trim: true,
      },
    },
    status: {
      type: Boolean,
      default: false,
    },
  },
  status: {
    type: String,
    default: STATUS_INITIATED,
    enum: [STATUS_INITIATED, STATUS_OTP_VR, STATUS_ACTIVE],
    trim: true,
  },
}, { timestamps: true });

module.exports = model('buyer', BuyerSchema);
