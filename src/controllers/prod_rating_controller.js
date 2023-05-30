const ErrorService = require('../services/ErrorService');
const { findInvRec } = require('../services/InvoiceService');
const { logger } = require('../utils/logger');
const { add, find } = require('../services/prod_rating_service');
const {
  validateAddProdRating,
} = require('../validations/prod_rating_validations');
const { REVIEW_NA, INV_REC_NF, RATING_CONFLICT } = require('../constants/custom_errors');
const { validateGetOne } = require('../validations/product_validations');
const ProdRatingService = require('../services/prod_rating_service');

const addProdRating = async (req, res, next) => {
  try {
    if (!req.buyer) {
      throw new Error('Missing auth middleware call before controller function');
    }

    const { error } = validateAddProdRating(req.body);

    if (error) {
      next(ErrorService.badRequest(error.details[0].message));
      return;
    }

    const invRec = await findInvRec({ _id: req.body.invoiceRecordId });

    if (!invRec) {
      next(new ErrorService(404, 'Invoice record is not exist', INV_REC_NF));
      return;
    }

    if (!invRec.buyer.equals(req.buyer._id)) {
      next(new ErrorService(405, 'Not purchased items are not allowed to be reviewed', REVIEW_NA));
      return;
    }

    if (invRec.rating.status) {
      next(new ErrorService(409, 'One invoice record can only be rated once', RATING_CONFLICT));
      return;
    }

    const result = await add(req.body);

    res.status(200).send(result);
  } catch (err) {
    next(ErrorService.internal(err.message));
  }
};

const getProdRatings = async (req, res, next) => {
  try {
    if (!req.buyer) {
      throw new Error('Missing auth middleware call before controller function');
    }

    const result = await find(req.buyer._id);

    res.status(200).send(result);

    logger.info(`(${req.buyer._id}) retrieving all the reviews`);
  } catch (err) {
    next(ErrorService.internal(err.message));
  }
};

const findIRatingsOfProducts = async (req, res, next) => {
  try {
    const { error } = validateGetOne(req.params);
    if (error) {
      next(ErrorService.badRequest(error.details[0].message));
      return;
    }

    const invoiceRecord = await ProdRatingService.findRatingsForProducts(req.params.productId);

    logger.info(`retrieving Product (${req.params.productId}) invoiceRecords for ratings`);

    res.status(200).send(invoiceRecord);
  } catch (err) {
    next(ErrorService.internal(err.message));
  }
};

const getUserAndRatings = async (req, res, next) => {
  try {
    const { error } = validateGetOne(req.params);
    if (error) {
      next(ErrorService.badRequest(error.details[0].message));
      return;
    }

    const result = await ProdRatingService.calculateRatingwithUsers(req.params.productId);

    logger.info(`retrieving Product (${req.params.productId}) invoiceRecords for ratings`);

    res.status(200).send(result);
  } catch (err) {
    next(ErrorService.internal(err.message));
  }
};

module.exports = {
  addProdRating, getProdRatings, findIRatingsOfProducts, getUserAndRatings,
};
