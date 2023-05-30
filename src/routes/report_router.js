const express = require('express');
const { authSeller } = require('../middlewares/seller');
const { productSellsForCategory, categorySelection, productForGroup } = require('../controllers/report_controller');

module.exports = () => {
  const router = express.Router();

  router.post('/product-sells', authSeller, productSellsForCategory);
  router.post('/categories-selection', authSeller, categorySelection);
  router.post('/products-for-group', authSeller, productForGroup);

  return router;
};
