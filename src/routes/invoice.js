const express = require('express');
const {
  AddInvoice,
  findInvoiceById,
  findAllInvoices,
  AddInvoiceFromBuyNow,
  getPaginationCount,
  getPaginationDocuments,
  updateShippingAddress,
  findSpecificInvoiceForBuyerById,
} = require('../controllers/invoice_controller');
const { authBuyer } = require('../middlewares/buyer');

module.exports = () => {
  const router = express.Router();

  router.post('/add-invoice', authBuyer, AddInvoice);
  router.post('/add-invoice-from-buynow', authBuyer, AddInvoiceFromBuyNow);
  router.get('/get-invoice/:invoiceId', authBuyer, findInvoiceById);
  router.get('/get-all-invoices', authBuyer, findAllInvoices);
  router.get('/get-pagination-count', authBuyer, getPaginationCount);
  router.get('/get-documents-for-pagination/:page', authBuyer, getPaginationDocuments);
  router.patch('/update-shipping-address', authBuyer, updateShippingAddress);
  router.get('/get-specific-invoice-for-buyer/:invoiceId', authBuyer, findSpecificInvoiceForBuyerById);
  return router;
};
