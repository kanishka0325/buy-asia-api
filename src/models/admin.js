const { Schema, model } = require('mongoose');
const {
  STATUS_INITIATED, STATUS_OTP_VR, STATUS_EMAIL_VR, STATUS_ACTIVE,
} = require('../constants/status');
const { TYPE_SP_ADMIN, TYPE_ADMIN } = require('../constants/user_types');

const AdminSchema = new Schema({
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
  mobile: {
    type: String,
    index: true,
    unique: true,
    sparse: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  type: {
    type: String,
    required: true,
    enum: [TYPE_SP_ADMIN, TYPE_ADMIN],
    trim: true,
  },
  status: {
    type: String,
    default: STATUS_INITIATED,
    enum: [STATUS_INITIATED, STATUS_EMAIL_VR, STATUS_ACTIVE],
    trim: true,
  },
  password: {
    type: String,
    trim: true,
  },
}, { timestamps: true });

module.exports = model('admin', AdminSchema);
