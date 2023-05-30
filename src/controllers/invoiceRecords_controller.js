/* eslint-disable max-len */
const { SENDER_BUYASIA } = require('../constants/senders');
const { STATUS_DELIVERED } = require('../constants/status');
const { SUBJECT_ORDER_UPDATE } = require('../constants/subjects');
const { TMPLT_ORDER_PACKAGING, TMPLT_ORDER_DELIVERED } = require('../constants/templates');
const ErrorService = require('../services/ErrorService');
const InvoiceRecordsService = require('../services/InvoiceRecordsService');
const { send } = require('../services/mail_service');
const { logger } = require('../utils/logger');
const { pageNumberValidation, updateInvoiceRecordStatusValidation } = require('../validations/InvoiceRecords_validation');

const findInvoiceRecords = async (req, res, next) => {
  try {
    if (!req.buyer) {
      throw new Error('Missing auth middleware call before controller function');
    }

    const invoiceRecords = await InvoiceRecordsService.find(req.buyer._id);

    logger.info(`buyer (${req.buyer._id}) retrieving invoiceRecords for reviews`);

    res.status(200).send(invoiceRecords);
  } catch (err) {
    next(ErrorService.internal(err.message));
  }
};

const findSpecificInvoiceRecordsForSeller = async (req, res, next) => {
  try {
    if (!req.seller) {
      throw new Error('Missing auth middleware call before controller function');
    }

    const invoiceRecord = await InvoiceRecordsService.findbyId(req.params.id);

    logger.info(`seller (${req.seller._id}) retrieving invoiceRecord of ${req.params.id}`);

    res.status(200).send(invoiceRecord);
  } catch (err) {
    next(ErrorService.internal(err.message));
  }
};

const findInvoiceRecordsForSeller = async (req, res, next) => {
  try {
    if (!req.seller) {
      throw new Error('Missing auth middleware call before controller function');
    }

    const invoiceRecords = await InvoiceRecordsService.findInvoicesForSeller(req.seller._id, req.body);

    logger.info(`seller (${req.seller._id}) retrieving invoiceRecords for reviews`);

    res.status(200).send(invoiceRecords);
  } catch (err) {
    next(ErrorService.internal(err.message));
  }
};

const findInvoiceRecordsCount = async (req, res, next) => {
  try {
    if (!req.buyer) {
      throw new Error('Missing auth middleware call before controller function');
    }

    const invoiceRecords = await InvoiceRecordsService.count(req.buyer._id);

    logger.info(`buyer (${req.buyer._id}) retrieving invoiceRecords for reviews`);

    res.status(200).send({ invoiceRecords });
  } catch (err) {
    next(ErrorService.internal(err.message));
  }
};

const getPaginationCount = async (req, res, next) => {
  try {
    if (!req.buyer) {
      throw new Error('Missing auth middleware call before controller function');
    }

    const reviews = await InvoiceRecordsService.find(req.buyer._id);

    const count = InvoiceRecordsService.sepratingForPagination(reviews);

    logger.info(`buyer (${req.buyer._id}) retreiving reviews count`);

    res.status(200).send({ count });
  } catch (err) {
    next(ErrorService.internal(err.message));
  }
};

const updateInvoiceRecordStatus = async (req, res, next) => {
  try {
    if (!req.seller) {
      throw new Error('Missing auth middleware call before controller function');
    }

    const { error } = updateInvoiceRecordStatusValidation(req.body);

    if (error) {
      next(ErrorService.badRequest(error.details[0].message));
      return;
    }

    const invoiceRecord = await InvoiceRecordsService.modify(req.body.id, { status: req.body.status });

    logger.info(`seller (${req.seller._id}) updating status in invoiceRecord of ${req.body.id}`);

    let template = TMPLT_ORDER_PACKAGING;

    if (invoiceRecord.status === STATUS_DELIVERED) {
      template = TMPLT_ORDER_DELIVERED;
    }

    const context = {
      title: SUBJECT_ORDER_UPDATE,
      firstName: invoiceRecord.buyerName,
      productTitle: invoiceRecord.productTitle,
      invoiceNo: invoiceRecord.invoiceNumber,
      sender: SENDER_BUYASIA,
    };

    await send(['w3gtest@gmail.com'], template, context);

    res.status(200).send(invoiceRecord);
  } catch (err) {
    next(ErrorService.internal(err.message));
  }
};

const getPaginationDocuments = async (req, res, next) => {
  try {
    if (!req.buyer) {
      throw new Error('Missing auth middleware call before controller function');
    }

    const { error } = pageNumberValidation(req.params);

    if (error) {
      next(ErrorService.badRequest(error.details[0].message));
      return;
    }

    let reviews = await InvoiceRecordsService.find(req.buyer._id);

    reviews = await InvoiceRecordsService.getPaginationReviews(req.params.page, reviews);

    logger.info(`buyer (${req.buyer._id}) invoice details for related page`);

    res.status(200).send({ reviews });
  } catch (err) {
    next(ErrorService.internal(err.message));
  }
};

const findSpecificReviewsForSeller = async (req, res, next) => {
  try {
    if (!req.seller) {
      throw new Error('Missing auth middleware call before controller function');
    }

    const result = await InvoiceRecordsService.findReviewsForSeller(req.seller._id, req.body);

    logger.info(`seller (${req.seller._id}) retrieving invoiceRecord of ${req.params.id}`);

    res.status(200).send(result);
  } catch (err) {
    next(ErrorService.internal(err.message));
  }
};

const getSellerInvoicesForPublic = async (req, res, next) => {
  try {
    const result = await InvoiceRecordsService.findinvoicesForSpecificSeller(req.params.sellerId);

    logger.info(`buyer retrieving (${req.params.sellerId}) sold items`);

    res.status(200).send(result);
  } catch (err) {
    next(ErrorService.internal(err.message));
  }
};

module.exports = {
  findInvoiceRecords,
  getPaginationCount,
  getPaginationDocuments,
  findInvoiceRecordsCount,
  findInvoiceRecordsForSeller,
  updateInvoiceRecordStatus,
  findSpecificInvoiceRecordsForSeller,
  findSpecificReviewsForSeller,
  getSellerInvoicesForPublic,
};
