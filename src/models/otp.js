const { Schema, model } = require('mongoose');

const OtpSchema = new Schema({
  otp: {
    type: String,
    required: true,
    trim: true,
  },
  expTime: {
    type: Date,
    required: true,
  },
  verified: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

module.exports = model('otp', OtpSchema);
