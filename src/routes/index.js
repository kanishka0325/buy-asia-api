const express = require('express');
const testRoute = require('./test_router');
const sellerRoute = require('./seller_router');
const buyerRoute = require('./buyer_router');
const adminRoute = require('./admin_router');
const publicRoute = require('./public_router');
const cartRoute = require('./cart');
const paymentRoute = require('./payment');
const invoiceRoute = require('./invoice');
const invoiceRecordRoute = require('./invoice_record_router');
const wishListRoute = require('./wishList_router');
const reportRoute = require('./report_router');
const messageRouter = require('./message_router');

module.exports = () => {
  const router = express.Router();
  router.use('/test', testRoute());
  router.use('/seller', sellerRoute());
  router.use('/admin', adminRoute());
  router.use('/public', publicRoute());
  router.use('/buyer', buyerRoute());
  router.use('/cart', cartRoute());
  router.use('/payment', paymentRoute());
  router.use('/invoice', invoiceRoute());
  router.use('/invoiceRecord', invoiceRecordRoute());
  router.use('/wishList', wishListRoute());
  router.use('/reports', reportRoute());
  router.use('/message', messageRouter());
  return router;
};