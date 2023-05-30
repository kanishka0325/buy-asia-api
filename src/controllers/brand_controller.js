const { toUpper } = require('lodash');
const { logger } = require('../utils/logger');
const ErrorService = require('../services/ErrorService');
const {
  add, findByName, getWpgn, modify, getMultiple,
} = require('../services/brand_service');
const { findCategories } = require('../services/category_service');
const {
  validateAddBrand,
  validateGet,
  validateModify,
  validateGetByCategory,
} = require('../validations/brand_validations');
const { DUP_BRAND_NAME, INVALID_CATS, PROD_BRAND_NF } = require('../constants/custom_errors');

const addProdBrand = async (req, res, next) => {
  try {
    const { error } = validateAddBrand(req.body);

    if (error) {
      next(ErrorService.badRequest(error.details[0].message));
      return;
    }

    const categories = await findCategories({ _id: { $in: req.body.categories } });

    if (categories.length !== req.body.categories.length) {
      next(new ErrorService(404, 'Invalid categories found', INVALID_CATS));
      return;
    }

    const brand = await findByName(toUpper(req.body.name));

    if (brand) {
      next(new ErrorService(409, 'Name already exists', DUP_BRAND_NAME));
      return;
    }

    const result = await add(req.body);

    res.status(200).send(result);

    logger.info(`Created new document (${result._id}) in prod_brand collection`);
  } catch (err) {
    next(ErrorService.internal(err.message));
  }
};

const getBrandsWpgn = async (req, res, next) => {
  try {
    const { error } = validateGet(req.query);

    if (error) {
      next(ErrorService.badRequest(error.details[0].message));
      return;
    }

    const result = await getWpgn(
      req.query.skip,
      req.query.limit,
      req.query.search,
    );

    res.status(200).send(result);

    logger.info(`Attempt on ${req.method} ${req.originalUrl} is successfull`);
  } catch (err) {
    next(ErrorService.internal(err.message));
  }
};

const modifyProdBrand = async (req, res, next) => {
  try {
    if (!req.auth) {
      throw new Error('Missing auth middleware call before controller function');
    }

    const { error } = validateModify(req.body);

    if (error) {
      next(ErrorService.badRequest(error.details[0].message));
      return;
    }

    const result = await modify(req.body.id, req.body.upBody);

    if (!result) {
      next(new ErrorService(404, 'Product Brand is not exist', PROD_BRAND_NF));
      return;
    }

    res.status(200).send(result);

    logger.info(`Modified document (${result._id}) of prod_brand collection`);
  } catch (err) {
    next(ErrorService.internal(err.message));
  }
};

const getByCategory = async (req, res, next) => {
  try {
    // if (!req.auth && !req.seller) {
    //   throw new Error('Missing auth middleware call before controller function');
    // }

    const { error } = validateGetByCategory(req.params);

    if (error) {
      next(ErrorService.badRequest(error.details[0].message));
      return;
    }

    const result = await getMultiple({ categories: req.params.catId });

    res.status(200).send(result);

    logger.info(`Attempt on ${req.method} ${req.originalUrl} is successfull`);
  } catch (err) {
    next(ErrorService.internal(err.message));
  }
};

module.exports = {
  addProdBrand,
  getBrandsWpgn,
  modifyProdBrand,
  getByCategory,
};
