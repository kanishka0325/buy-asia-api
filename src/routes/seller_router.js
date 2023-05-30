const express = require('express');
const { getProdCats, getProdSubCats, getProdGroups } = require('../controllers/category_controller');
const {
  addProduct, getProductsForSeller, modifyProduct, getProductsForSellerReviewsFilter,
} = require('../controllers/product_controller');
const {
  init,
  verifyOtp,
  verifyEmail,
  pending,
  login,
  addInfo,
  setTemplate,
  refreshSeller,
  getOtp,
  compareOtp,
  resetPass,
  updateTemplate,
  updateSellerInfo,
  validateToken,
} = require('../controllers/seller_controller');
const { addTempProdBrand } = require('../controllers/temp_brand_controller');

const {
  authAddInfo, authSeller, authRefreshSeller,
} = require('../middlewares/seller');
const { mobileFromToken } = require('../middlewares/public_middlewares');

const {
  findInvoiceRecordsForSeller,
  updateInvoiceRecordStatus,
  findSpecificInvoiceRecordsForSeller,
  findSpecificReviewsForSeller,
} = require('../controllers/invoiceRecords_controller');

module.exports = () => {
  const router = express.Router();

  router.post('/init', init);

  router.patch('/verify-otp', verifyOtp);

  router.get('/verify-email/:token', verifyEmail);

  router.patch('/pending', pending);

  router.patch('/set-template', authSeller, setTemplate);

  router.patch('/update-template', authSeller, updateTemplate);

  router.patch('/update-seller', authSeller, updateSellerInfo);

  router.post('/login', login);

  router.patch('/add-info', authAddInfo, addInfo);

  router.post('/add-product', authSeller, addProduct);

  router.get('/get-prod-cats', authSeller, getProdCats);

  router.get('/get-prod-sub-cats:id?', authSeller, getProdSubCats);

  router.get('/get-prod-groups:id?', authSeller, getProdGroups);

  router.get('/get-products:skip?:limit?:search?:catId?:subCatId?:groupId?:brandId?:title?:createdAt?', authSeller, getProductsForSeller);

  router.patch('/update-product', authSeller, modifyProduct);

  // router.get('/refresh', authRefreshSeller, refreshSeller);

  // add a brand requisition
  router.post('/add-prod-brand-req', authSeller, addTempProdBrand);

  router.post('/get-invoice-records', authSeller, findInvoiceRecordsForSeller);

  router.post('/get-reviews', authSeller, findSpecificReviewsForSeller);

  router.get('/get-prod-for-filter', authSeller, getProductsForSellerReviewsFilter);

  router.patch('/update-invoiceRecord-status', authSeller, updateInvoiceRecordStatus);

  // find account and
  // send user a mail containing, otp for reset password and direct reset password link
  router.post('/find-account', getOtp);

  // verify account by comparing otp
  router.patch('/compare-otp', compareOtp);

  // reset password
  router.patch('/reset-pass', mobileFromToken, resetPass);

  router.get('/get-specific-invoice-record/:id', authSeller, findSpecificInvoiceRecordsForSeller);

  router.get('/token-validate', authSeller, validateToken);

  return router;
};
