const { Schema, model } = require('mongoose');

const SellerProdCategorySchema = new Schema({
  sellerId: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  prodCategory: {
    type: Schema.Types.ObjectId,
    ref: 'prod_category',
    required: true,
  },
}, { timestamps: true });

module.exports = model('seller_prod_category', SellerProdCategorySchema);
