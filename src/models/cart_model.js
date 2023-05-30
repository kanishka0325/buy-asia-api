const { Schema, model } = require('mongoose');

const CartSchema = new Schema({
  buyer: {
    type: Schema.Types.ObjectId,
    ref: 'buyer',
    required: true,
  },
  product: {
    type: Schema.Types.ObjectId,
    ref: 'product',
    required: true,
  },
  amount: {
    type: Number,
    trim: true,
  },
  store: {
    type: String,
    trim: true,
  },
  quantity: {
    type: Number,
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
  variantComboId: {
    type: String,
    trim: true,
  },

}, { timestamps: true });

module.exports = model('cart', CartSchema);
