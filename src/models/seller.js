const { Schema, model } = require('mongoose');
const {
  SELLER_TMPLT_FIRST, SELLER_TMPLT_FOURTH, SELLER_TMPLT_THIRD, SELLER_TMPLT_SECOND,
} = require('../constants/seller_templates');
const {
  STATUS_OTP_VR,
  STATUS_EMAIL_VR,
  STATUS_PENDING_APR,
  STATUS_PRO_DONE,
  STATUS_INITIATED,
  STATUS_ACTIVE,
} = require('../constants/status');

const SellerSchema = new Schema({
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
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    trim: true,
  },
  basic: {
    companyName: {
      type: String,
      trim: true,
    },
    tradeName: {
      type: String,
      trim: true,
    },
    type: {
      type: String,
      trim: true,
    },
    brno: {
      type: String,
      uppercase: true,
      unique: true,
      sparse: true,
      trim: true,
    },
    tin: {
      type: String,
      trim: true,
    },
    logo: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      maxlength: 1000,
      trim: true,
    },
    template: {
      type: String,
      enum: [SELLER_TMPLT_FIRST, SELLER_TMPLT_SECOND, SELLER_TMPLT_THIRD, SELLER_TMPLT_FOURTH],
    },
    cover: {
      type: String,
      trim: true,
    },
  },
  contact: {
    regAddress: {
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
    contactNums: {
      type: [
        {
          type: String,
          trim: true,
        },
      ],
      validate: {
        validator(v) {
          return v.length <= 3;
        },
        message: (props) => `${props.path} exceeds the limit of 3`,
      },
    },
    contactEmail: {
      type: String,
      trim: true,
    },
  },
  cp: {
    cpName: {
      type: String,
      trim: true,
    },
    cpDesignation: {
      type: String,
      trim: true,
    },
    cpContactNum: {
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
  prStatus: {
    type: String,
    default: STATUS_INITIATED,
    enum: [STATUS_INITIATED, STATUS_PRO_DONE],
    trim: true,
  },
  rejReason: {
    type: String,
    trim: true,
  },
}, { timestamps: true });

module.exports = model('seller', SellerSchema);
