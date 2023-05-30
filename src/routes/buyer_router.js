const express = require('express');
const {
  registration,
  verifyOtp,
  confirmPassword,
  addPersonalDetails,
  addAddressDetails,
  login,
  createOTP,
  getOtp,
  compareOtp,
  resetPass,
} = require('../controllers/buyer_controller');
const { addProdRating, getProdRatings } = require('../controllers/prod_rating_controller');
const { authBuyer } = require('../middlewares/buyer');
const { mobileFromToken } = require('../middlewares/public_middlewares');

module.exports = () => {
  const router = express.Router();

  router.post('/login', login);

  router.post('/sign-up', registration);

  router.patch('/verify-otp', verifyOtp);

  router.patch('/confirm-password', authBuyer, confirmPassword);

  router.patch('/set-personal-details', authBuyer, addPersonalDetails);

  router.patch('/set-address-details', authBuyer, addAddressDetails);

  router.post('/create-otp', createOTP);

  // rate a product
  router.post('/rate-product', authBuyer, addProdRating);

  router.get('/get-reviews', authBuyer, getProdRatings);

  // find account and
  // send user a mail containing, otp for reset password and direct reset password link
  router.post('/find-account', getOtp);

  // verify account by comparing otp
  router.patch('/compare-otp', compareOtp);

  // reset password
  router.patch('/reset-pass', mobileFromToken, resetPass);

  return router;
};
