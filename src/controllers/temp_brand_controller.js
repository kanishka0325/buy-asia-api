const { logger } = require('../utils/logger');
const ErrorService = require('../services/ErrorService');
const {
  add, getWpgn, proceed, findOne,
} = require('../services/temp_brand_service');
const { findCategory } = require('../services/category_service');
const { validateAddBrand, validateGet, validateProceed } = require('../validations/temp_brand_validations');
const { PROD_CAT_NF, TEMP_BRAND_NF, BRAND_REVIEW_CONFLICT } = require('../constants/custom_errors');
const { STATUS_PENDING_APR } = require('../constants/status');

const addTempProdBrand = async (req, res, next) => {
  try {
    if (!req.seller) {
      throw new Error('Missing auth middleware call before controller function');
    }

    const { error } = validateAddBrand(req.body);

    if (error) {
      next(ErrorService.badRequest(error.details[0].message));
      return;
    }

    const category = await findCategory({ _id: req.body.prodCategory });

    if (!category) {
      next(new ErrorService(404, 'Product Category is not exist', PROD_CAT_NF));
      return;
    }

    const body = {
      ...req.body,
      seller: {
        _id: req.seller._id,
        email: req.seller.email,
      },
    };

    const result = await add(body);

    res.status(200).send(result);

    logger.info(`Created new document (${result._id}) in temp_prod_brand collection`);
  } catch (err) {
    next(ErrorService.internal(err.message));
  }
};

const getByAdmin = async (req, res, next) => {
  try {
    if (!req.auth) {
      throw new Error('Missing auth middleware call before controller function');
    }

    const { error } = validateGet(req.query);

    if (error) {
      next(ErrorService.badRequest(error.details[0].message));
      return;
    }

    const result = await getWpgn(req.query.skip, req.query.limit, req.query.search);

    res.status(200).send(result);
  } catch (err) {
    next(ErrorService.internal(err.message));
  }
};

const proceedReq = async (req, res, next) => {
  try {
    if (!req.auth) {
      throw new Error('Missing auth middleware call before controller function');
    }

    const { error } = validateProceed(req.body);

    if (error) {
      next(ErrorService.badRequest(error.details[0].message));
      return;
    }

    const tempBrand = await findOne({ _id: req.body.id }, true);

    if (!tempBrand) {
      next(new ErrorService(404, 'Tempory Brand is not exist', TEMP_BRAND_NF));
      return;
    }

    if (tempBrand.status !== STATUS_PENDING_APR) {
      next(new ErrorService(404, `This brand requisition is already ${tempBrand.status}!`, BRAND_REVIEW_CONFLICT));
      return;
    }

    const result = await proceed(req.body.upBody, tempBrand);

    res.status(200).send(result);
  } catch (err) {
    next(ErrorService.internal(err.message));
  }
};

module.exports = {
  addTempProdBrand,
  getByAdmin,
  proceedReq,
};
