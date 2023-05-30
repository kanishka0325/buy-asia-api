const express = require('express');
const {
  authSuperAdmin, authAdmins,
} = require('../middlewares/admin');
const {
  login, verifyOtp, addUser, verifyEmail, activate, getUsers,
} = require('../controllers/admin_controller');
const {
  getSellers, reviewSeller,
} = require('../controllers/seller_controller');
const {
  addProdCat,
  addProdSubCat,
  addProdGroup,
  getProdCats,
  getProdSubCats,
  getProdGroups,
  modifyProdCat,
  modifyProdSubCat,
  modifyProdGroup,
} = require('../controllers/category_controller');
const {
  addProdBrand, getBrandsWpgn, modifyProdBrand,
} = require('../controllers/brand_controller');

const {
  getByAdmin, proceedReq,
} = require('../controllers/temp_brand_controller');

module.exports = () => {
  const router = express.Router();

  router.post('/login', login);
  router.patch('/verify-otp', verifyOtp);
  router.post('/add', authSuperAdmin, addUser);
  router.get('/verify-email/:token', verifyEmail);
  router.patch('/activate', activate);
  router.get('/get-sellers:skip?:limit?:from?:to?', authAdmins, getSellers);
  router.patch('/review-seller', authAdmins, reviewSeller);
  router.get('/get-users:skip?:limit?:search?', authSuperAdmin, getUsers);
  router.post('/add-prod-cat', authAdmins, addProdCat);
  router.post('/add-prod-sub-cat', authAdmins, addProdSubCat);
  router.post('/add-prod-group', authAdmins, addProdGroup);
  router.get('/get-prod-cats', authAdmins, getProdCats);
  router.get('/get-prod-sub-cats?:id', authAdmins, getProdSubCats);
  router.get('/get-prod-groups?:id', authAdmins, getProdGroups);
  router.patch('/update-prod-cat', authAdmins, modifyProdCat);
  router.patch('/update-prod-sub-cat', authAdmins, modifyProdSubCat);
  router.patch('/update-prod-group', authAdmins, modifyProdGroup);
  router.post('/add-prod-brand', authAdmins, addProdBrand);
  router.get('/get-prod-brands:skip?:limit?:search?', authAdmins, getBrandsWpgn);

  // update a product brand
  router.patch('/update-prod-brand', authAdmins, modifyProdBrand);

  // retrieve brand requisitions
  router.get('/prod-brand-req/get:skip?:limit?:search?', authAdmins, getByAdmin);

  // approve or reject a brand requisition
  router.patch('/prod-brand-req/proceed', authAdmins, proceedReq);

  return router;
};
