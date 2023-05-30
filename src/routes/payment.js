const express = require('express');
const { getPaymentAmount, getPaymentAmountForBuyNow } = require('../controllers/payment_controller');
const { authBuyer } = require('../middlewares/buyer');

module.exports = () => {
  const router = express.Router();

  router.get('/get-amount', authBuyer, getPaymentAmount);
  router.post('/get-amount/buy-now', authBuyer, getPaymentAmountForBuyNow);

  return router;
};
