const express = require('express');
const {
  getVariants,
} = require('../controllers/variant_controller');
const {
  getAll, getCategoriesForPublic,
} = require('../controllers/category_controller');
const {
  getProducts,
  getProduct,
  getRelatedProducts,
  getRelatedProductsFromArray,
  getRecentlyViewedProducts,
  getProductsForSellerInSellerPage,
} = require('../controllers/product_controller');
const { authPublic } = require('../middlewares/public_middlewares');
const { getByCategory, getBrandsWpgn } = require('../controllers/brand_controller');
const { findIRatingsOfProducts, getUserAndRatings } = require('../controllers/prod_rating_controller');
const { getSellerForBuyer } = require('../controllers/seller_controller');
const { getSellerInvoicesForPublic } = require('../controllers/invoiceRecords_controller');

module.exports = () => {
  const router = express.Router();

  router.get('/get-variants', authPublic, getVariants);
  router.get('/categories/get-all', getAll);
  router.get('/get-products:skip?:limit?:search?:sortRating?:min?:max?:avgRating?:catId?:subCatId?:groupId?:brandId?', getProducts);
  router.get('/get-product/:productId', getProduct);
  router.get('/get-product-reviews/:productId', findIRatingsOfProducts);
  router.get('/get-users-and-ratings/:productId', getUserAndRatings);
  router.get('/get-related-products/:prodGroup', getRelatedProducts);
  router.post('/get-related-products-from-array', getRelatedProductsFromArray);
  router.post('/get-recently-viewed-products', getRecentlyViewedProducts);

  // get brands by category
  router.get('/prod-brand/get-prod-brands/:catId', getByCategory);

  // get brands with pagination
  router.get('/prod-brand/get-prod-brands:skip?:limit?:search?', getBrandsWpgn);

  router.get('/get-seller-details/:sellerId', getSellerForBuyer);

  router.get('/get-seller-sold-items/:sellerId', getSellerInvoicesForPublic);

  router.get('/get-seller-categories/:sellerId', getCategoriesForPublic);

  router.post('/get-products-for-seller', getProductsForSellerInSellerPage);

  return router;
};
