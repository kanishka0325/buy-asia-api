const { Schema, model } = require('mongoose');

const InvoiceSchema = new Schema({
  invoiceNo: {
    type: String,
    trim: true,
    required: true,
  },
  date: {
    type: Date,
    trim: true,
    required: true,
  },
  buyer: {
    type: Schema.Types.ObjectId,
    ref: 'buyer',
    required: true,
  },
  name: {
    type: String,
    trim: true,
    required: true,
  },
  total: {
    type: Number,
    trim: true,
    required: true,
  },
  totalDiscount: {
    type: Number,
    trim: true,
    required: true,
  },
  totalShipping: {
    type: Number,
    trim: true,
    required: true,
  },
  finalTotal: {
    type: Number,
    trim: true,
    required: true,
  },
  status: {
    type: String,
    trim: true,
    required: true,
  },
  transactionId: {
    type: String,
    trim: true,
    required: true,
  },
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
  invoicerecords: {
    type: [{
      type: Schema.Types.ObjectId,
      ref: 'invoiceRecord',
      required: true,
    }],
    validate: (v) => Array.isArray(v) && v.length,
  },
}, { timestamps: true });

module.exports = model('invoice', InvoiceSchema);
