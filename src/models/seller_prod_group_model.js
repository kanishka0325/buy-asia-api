const { Schema, model } = require('mongoose');

const SellerProdGroupSchema = new Schema({
  sellerId: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  prodSubCategory: {
    type: Schema.Types.ObjectId,
    ref: 'prod_sub_category',
    required: true,
  },
  prodGroup: {
    type: Schema.Types.ObjectId,
    ref: 'prod_group',
    required: true,
  },
}, { timestamps: true });

module.exports = model('seller_prod_group', SellerProdGroupSchema);
