const { Schema, model } = require('mongoose');
const {
  STATUS_OTP_VR,
  STATUS_EMAIL_VR,
  STATUS_PENDING_APR,
  STATUS_PRO_DONE,
  STATUS_INITIATED,
  STATUS_ACTIVE,
} = require('../constants/status');

const CustomerSchema = new Schema({
  firstName: {
    type: String,
    required: true,
    trim: true,
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    trim: true,
  },
  billingAddress: {
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
    zip: {
      type: String,
      trim: true,
    },
    country: {
      type: String,
      trim: true,
    },
  },
  shippingAddress: {
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
    type: String,
    default: STATUS_INITIATED,
    enum: [STATUS_INITIATED, STATUS_OTP_VR, STATUS_EMAIL_VR, STATUS_PENDING_APR, STATUS_ACTIVE],
    trim: true,
  },
}, { timestamps: true });

module.exports = model('customer', CustomerSchema);
