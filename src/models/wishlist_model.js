const { Schema, model } = require('mongoose');

const WishListSchema = new Schema({
  product: {
    type: Schema.Types.ObjectId,
    ref: 'product',
    required: true,
  },
  buyer: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  store: {
    type: String,
    trim: true,
    required: true,
  },
}, { timestamps: true });

module.exports = model('wishList', WishListSchema);
