const { Schema, model } = require('mongoose');

const SellerProdSubCategorySchema = new Schema({
  sellerId: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  prodCategory: {
    type: Schema.Types.ObjectId,
    ref: 'prod_category',
    required: true,
  },
  prodSubCategory: {
    type: Schema.Types.ObjectId,
    ref: 'prod_sub_category',
    required: true,
  },
}, { timestamps: true });

module.exports = model('seller_prod_sub_category', SellerProdSubCategorySchema);
