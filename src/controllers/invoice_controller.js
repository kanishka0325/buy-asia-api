const { Types } = require('mongoose');
const { INVALID_OID, INVOICE_NF } = require('../constants/custom_errors');
const ErrorService = require('../services/ErrorService');
const InvoiceService = require('../services/InvoiceService');
const { logger } = require('../utils/logger');
const {
  InvoiceContentValidation,
  InvoiceContentForBuyNowValidation,
  pageNumberValidation,
  updateShippingAddressValidation,
} = require('../validations/invoice');
const InvoiceRecordsService = require('../services/InvoiceRecordsService');

const AddInvoice = async (req, res, next) => {
  try {
    if (!req.buyer) {
      throw new Error('Missing auth middleware call before controller function');
    }

    const { error } = InvoiceContentValidation(req.body);

    if (error) {
      next(ErrorService.badRequest(error.details[0].message));
      return;
    }

    const invoice = await InvoiceService.createInvoice(req.buyer, req.body);

    logger.info(`buyer (${req.buyer._id}) purchased cart items`);

    res.status(200).send({ invoice });
  } catch (err) {
    next(ErrorService.internal(err.message));
  }
};

const AddInvoiceFromBuyNow = async (req, res, next) => {
  try {
    if (!req.buyer) {
      throw new Error('Missing auth middleware call before controller function');
    }

    const { error } = InvoiceContentForBuyNowValidation(req.body);

    if (error) {
      next(ErrorService.badRequest(error.details[0].message));
      return;
    }

    const invoice = await InvoiceService.createInvoiceForBuyNow(req.buyer, req.body);

    logger.info(`buyer (${req.buyer._id}) purchased an item using buy now`);

    res.status(200).send({ invoice });
  } catch (err) {
    next(ErrorService.internal(err.message));
  }
};

const findInvoiceById = async (req, res, next) => {
  try {
    if (!req.buyer) {
      throw new Error('Missing auth middleware call before controller function');
    }

    const { invoiceId } = req.params;

    const invoice = await InvoiceService.findOne(invoiceId);

    res.writeHead(200, {
      'Content-Type': 'application/pdf',
      invoice: JSON.stringify(invoice),
    });

    await InvoiceService.createInvoicePdf(invoice, res);

    logger.info(`buyer (${req.buyer._id}) retreiving invoice details with pdf`);

    // res.status(200).send({ invoice });
  } catch (err) {
    next(ErrorService.internal(err.message));
  }
};

const findSpecificInvoiceForBuyerById = async (req, res, next) => {
  try {
    if (!req.buyer) {
      throw new Error('Missing auth middleware call before controller function');
    }

    const { invoiceId } = req.params;

    const invoice = await InvoiceService.findOne(invoiceId);

    res.status(200).send(invoice);
  } catch (err) {
    next(ErrorService.internal(err.message));
  }
};

const findAllInvoices = async (req, res, next) => {
  try {
    if (!req.buyer) {
      throw new Error('Missing auth middleware call before controller function');
    }

    const invoices = await InvoiceService.findAll(req.buyer._id);

    logger.info(`buyer (${req.buyer._id}) retreiving all invoice details`);

    res.status(200).send(invoices);
  } catch (error) {
    next(ErrorService.internal(error.message));
  }
};

const getInvoice = async (req, res, next) => {
  try {
    if (!req.buyer) {
      throw new Error('Missing auth middleware call before controller function');
    }

    if (!Types.ObjectId.isValid(req.params.invoiceId)) {
      next(new ErrorService(400, 'Invalid value supplied to the parameter invoiceId, expected ObjectId', INVALID_OID));
      return;
    }

    const invoice = await InvoiceService.find({
      _id: req.params.invoiceId, buyer: req.buyer._id,
    }, true);

    if (!invoice) {
      next(new ErrorService(404, 'Invoice not found', INVOICE_NF));
      return;
    }

    // const fssdsf = moment(invoice.createdAt).format('Do, of MMMM YYYY');
    // console.log(fssdsf);

    res.writeHead(200, {
      'Content-Type': 'application/pdf',
      // invoice: JSON.stringify(invoice),
    });

    InvoiceService.createInvoicePdf(invoice, res);

    // res.status(200).send(invoice);

    logger.info(`Attempt on ${req.method} ${req.originalUrl} is successfull`);
  } catch (error) {
    next(ErrorService.internal(error.message));
  }
};

const getPaginationCount = async (req, res, next) => {
  try {
    if (!req.buyer) {
      throw new Error('Missing auth middleware call before controller function');
    }

    const invoices = await InvoiceService.findAll(req.buyer._id);

    const count = InvoiceService.sepratingForPagination(invoices);

    logger.info(`buyer (${req.buyer._id}) retreiving all invoice details`);

    res.status(200).send({ count });
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

    let invoices = await InvoiceService.findAll(req.buyer._id);

    invoices = await InvoiceService.getPaginationInvoices(req.params.page, invoices);

    logger.info(`buyer (${req.buyer._id}) invoice details for related page`);

    res.status(200).send({ invoices });
  } catch (err) {
    next(ErrorService.internal(err.message));
  }
};

const updateShippingAddress = async (req, res, next) => {
  try {
    if (!req.buyer) {
      throw new Error('Missing auth middleware call before controller function');
    }

    const { error } = updateShippingAddressValidation(req.body);

    if (error) {
      next(ErrorService.badRequest(error.details[0].message));
      return;
    }

    // eslint-disable-next-line max-len
    const invoiceRecords = await InvoiceRecordsService.findDeliveredInvoiceRecord(req.body.invoiceId);

    if (invoiceRecords.length > 0) {
      next(ErrorService.badRequest('Purchase been either packaging or delivered. Cannot update the address'));
      return;
    }

    // eslint-disable-next-line max-len
    await InvoiceService.modifyManyInInvoiceRecords(req.body.invoiceId, { shippingAdd: req.body.shippingAdd });

    // eslint-disable-next-line max-len
    const updatedRecord = await InvoiceService.modify(req.body.invoiceId, { shippingAdd: req.body.shippingAdd });

    logger.info(`buyer (${req.buyer._id}) updating shipping address in invoice of ${req.body.invoiceId}`);

    res.status(200).send(updatedRecord);
  } catch (err) {
    next(ErrorService.internal(err.message));
  }
};

module.exports = {
  AddInvoice,
  findInvoiceById,
  findAllInvoices,
  getInvoice,
  AddInvoiceFromBuyNow,
  getPaginationCount,
  getPaginationDocuments,
  updateShippingAddress,
  findSpecificInvoiceForBuyerById,
};
