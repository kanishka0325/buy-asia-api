const express = require('express');
const {
  findInvoiceRecords,
  getPaginationCount,
  getPaginationDocuments,
  findInvoiceRecordsCount,
} = require('../controllers/invoiceRecords_controller');
const { authBuyer } = require('../middlewares/buyer');

module.exports = () => {
  const router = express.Router();

  router.get('/get-invoice-records', authBuyer, findInvoiceRecords);
  router.get('/get-invoice-records-count', authBuyer, findInvoiceRecordsCount);
  router.get('/get-pagination-count', authBuyer, getPaginationCount);
  router.get('/get-documents-for-pagination/:page', authBuyer, getPaginationDocuments);

  return router;
};
