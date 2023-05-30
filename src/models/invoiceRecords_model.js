const { Schema, model } = require('mongoose');
const { STATUS_INITIATED, STATUS_DELIVERED, STATUS_PACKAGING } = require('../constants/status');

const InvoiceRecordsSchema = new Schema({
  invoiceId: {
    type: Schema.Types.ObjectId,
    ref: 'invoice',
    required: true,
  },
  invoiceNumber: {
    type: String,
    trim: true,
    required: true,
  },
  productId: {
    type: Schema.Types.ObjectId,
    ref: 'product',
    required: true,
  },
  productTitle: {
    type: String,
    trim: true,
    required: true,
  },
  prodImageUrl: {
    type: String,
    trim: true,
    required: true,
  },
  sellerName: {
    type: String,
    trim: true,
    required: true,
  },
  date: {
    type: Date,
    trim: true,
    required: true,
  },
  seller: {
    type: Schema.Types.ObjectId,
    // ref: 'seller',
    required: true,
  },
  unit_price: {
    type: Number,
    trim: true,
    required: true,
  },
  quantity: {
    type: Number,
    trim: true,
    required: true,
  },
  buyer: {
    type: Schema.Types.ObjectId,
    ref: 'buyer',
    required: true,
  },
  phoneNumber: {
    type: String,
    trim: true,
  },
  buyerName: {
    type: String,
    trim: true,
    required: true,
  },
  email: {
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
  paymentId: {
    type: String,
    trim: true,
    required: true,
  },
  status: {
    type: String,
    default: STATUS_INITIATED,
    enum: [STATUS_INITIATED, STATUS_PACKAGING, STATUS_DELIVERED],
    trim: true,
  },
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
  },
  total: {
    type: Number,
    trim: true,
    required: true,
  },
  sellerPortion: {
    type: Number,
    trim: true,
    required: true,
  },
  buyAsiaPortion: {
    type: Number,
    trim: true,
    required: true,
  },
  rating: {
    type: {
      status: {
        type: Boolean,
      },
      value: {
        type: Number,
        min: 0,
        max: 5,
      },
      feedback: {
        type: String,
        trim: true,
      },
    },
    default: {
      status: false,
    },
    _id: false,
  },
}, { timestamps: true });

module.exports = model('invoiceRecord', InvoiceRecordsSchema);
