const ErrorService = require('../services/ErrorService');
const { logger } = require('../utils/logger');
const {
  add,
  find,
  getWpgnForSeller,
  modify,
  getWpgn,
  findRelatedProducts,
  findRelatedProductsFromArray,
  findRecentlyViewedProducts,
  sortVarianCombos,
  findProductsForReviewsFilter,
  findProductsForSellerInSellerPage,
} = require('../services/product_service');
const { findCategory, findSubCategory, findGroup } = require('../services/category_service');
const {
  find: findBrand, findOne,
} = require('../services/brand_service');
const {
  validateAdd,
  validateModify,
  validateGetBySeller,
  validateGet,
  validateGetOne,
  validateGetRelatedProducts,
  validateGetRelatedProductsFromArray,
  validateGetRecentlyViewedProductIds,
} = require('../validations/product_validations');
const {
  DUP_PRCODE,
  PROD_CAT_NF,
  PROD_SUB_CAT_NF,
  PROD_GROUP_NF,
  PROD_NF,
  PROD_BRAND_NF,
  PROD_BRAND_CAT_MM,
} = require('../constants/custom_errors');
const {
  NA,
} = require('../constants/http_codes');

const addProduct = async (req, res, next) => {
  try {
    if (!req.seller) {
      throw new Error('Missing auth middleware call before controller function');
    }

    const { error } = validateAdd(req.body);

    if (error) {
      next(ErrorService.badRequest(error.details));
      return;
    }

    const body = {
      seller: req.seller._id,
      ...req.body,
    };

    const product = await find({ code: body.code, seller: body.seller });

    if (product) {
      next(new ErrorService(404, 'Product code already exists', DUP_PRCODE));
      return;
    }

    const brand = await findBrand(body.prodBrand);

    if (!brand) {
      next(new ErrorService(404, 'Product brand is not exist', PROD_BRAND_NF));
      return;
    }

    if (!brand.categories.find((c) => c.equals(body.prodCategory))) {
      next(new ErrorService(404, 'Product brand not belongs to the selected product category', PROD_BRAND_CAT_MM));
      return;
    }

    const group = await findGroup({ _id: body.prodGroup }, true);

    if (!group) {
      next(new ErrorService(404, 'Product group is not exist', PROD_GROUP_NF));
      return;
    }

    if (!group.prodSubCategory._id.equals(body.prodSubCategory)) {
      next(new ErrorService(404, 'Product Sub Category is not exist', PROD_SUB_CAT_NF));
      return;
    }

    if (!group.prodSubCategory.prodCategory.equals(body.prodCategory)) {
      next(new ErrorService(404, 'Product Category is not exist', PROD_CAT_NF));
      return;
    }

    const result = await add(body);
    res.status(200).send(result);
  } catch (err) {
    next(ErrorService.internal(err.message));
  }
};

const getProductsForSeller = async (req, res, next) => {
  try {
    if (!req.seller) {
      throw new Error('Missing auth middleware call before controller function');
    }

    const { error } = validateGetBySeller(req.query);
    if (error) {
      next(ErrorService.badRequest(error.details[0].message));
      return;
    }

    const result = await getWpgnForSeller(
      req.query.skip,
      req.query.limit,
      req.seller._id,
      req.query.search,
      req.query.catId,
      req.query.subCatId,
      req.query.groupId,
      req.query.brandId,
      req.query.title,
      req.query.createdAt,
    );

    logger.info(`Attempt on ${req.method} ${req.originalUrl} is successfull`);

    res.status(200).send(result);
  } catch (err) {
    next(ErrorService.internal(err.message));
  }
};

const modifyProduct = async (req, res, next) => {
  try {
    if (!req.seller) {
      throw new Error('Missing auth middleware call before controller function');
    }

    const { error } = validateModify(req.body);

    if (error) {
      next(ErrorService.badRequest(error.details[0].message));
      return;
    }

    const product = await find({ _id: req.body.id, seller: req.seller._id });

    if (!product) {
      next(new ErrorService(404, 'Product is not exist', PROD_NF));
      return;
    }

    if (req.body.upBody.variantCombos) {
      if (product.variantCombos[0].variantCombo.length
        !== req.body.upBody.variantCombos[0].variantCombo.length) {
        next(new ErrorService(405, 'Not allowed to add or remove variants from variantCombo', NA));
        return;
      }
    }

    if (req.body.upBody.prodCategory) {
      const group = await findGroup({ _id: req.body.upBody.prodGroup }, true);

      if (!group) {
        next(new ErrorService(404, 'Product group is not exist', PROD_GROUP_NF));
        return;
      }

      if (!group.prodSubCategory._id.equals(req.body.upBody.prodSubCategory)) {
        next(new ErrorService(404, 'Product Sub Category is not exist', PROD_SUB_CAT_NF));
        return;
      }

      if (!group.prodSubCategory.prodCategory.equals(req.body.upBody.prodCategory)) {
        next(new ErrorService(404, 'Product Category is not exist', PROD_CAT_NF));
        return;
      }
    }

    const result = await modify(req.body.id, req.body.upBody);

    logger.info(`Attempt on ${req.method} ${req.originalUrl} is successfull`);

    res.status(200).send(result);
  } catch (err) {
    next(ErrorService.internal(err.message));
  }
};

const getProducts = async (req, res, next) => {
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
      req.query.sortRating,
      req.query.min,
      req.query.max,
      req.query.avgRating,
      req.query.catId,
      req.query.subCatId,
      req.query.groupId,
      req.query.brandId,
    );

    logger.info(`Attempt on ${req.method} ${req.originalUrl} is successfull`);

    res.status(200).send(result);
  } catch (err) {
    next(ErrorService.internal(err.message));
  }
};

const getProduct = async (req, res, next) => {
  try {
    const { error } = validateGetOne(req.params);
    if (error) {
      next(ErrorService.badRequest(error.details[0].message));
      return;
    }

    const result = await find({ _id: req.params.productId });

    let halfWayIndex = 0;
    let firstHalfOfArray = [];
    let secondHalfOfArray = [];

    if (result.specs.length > 1) {
      halfWayIndex = Math.ceil(result.specs.length / 2);
      firstHalfOfArray = result.specs.slice(0, halfWayIndex);
      secondHalfOfArray = result.specs.slice(halfWayIndex);
    } else {
      firstHalfOfArray = [result.specs[0]];
      secondHalfOfArray = [];
    }

    const specifications = {
      first: firstHalfOfArray,
      second: secondHalfOfArray,
    };

    // eslint-disable-next-line no-underscore-dangle
    const modifiedResult = { ...result._doc, specifications };

    logger.info(`Attempt on ${req.method} ${req.originalUrl} is successfull`);

    // // eslint-disable-next-line no-underscore-dangle
    // if (result._doc.variantCombos.length > 1) {
    //   const sortedData = await sortVarianCombos(req.params);
    //   modifiedResult.variantCombos = sortedData;
    // }

    res.status(200).send(modifiedResult);
  } catch (err) {
    next(ErrorService.internal(err.message));
  }
};

const getRelatedProducts = async (req, res, next) => {
  try {
    const { error } = validateGetRelatedProducts(req.params);
    if (error) {
      next(ErrorService.badRequest(error.details[0].message));
      return;
    }

    const result = await findRelatedProducts(req.params.prodGroup);

    logger.info(`Attempt on ${req.method} ${req.originalUrl} is successfull`);

    res.status(200).send(result);
  } catch (err) {
    next(ErrorService.internal(err.message));
  }
};

const getRelatedProductsFromArray = async (req, res, next) => {
  try {
    const { error } = validateGetRelatedProductsFromArray(req.body);
    if (error) {
      next(ErrorService.badRequest(error.details[0].message));
      return;
    }

    const result = await findRelatedProductsFromArray(req.body.prodGroup);

    logger.info(`Attempt on ${req.method} ${req.originalUrl} is successfull`);

    res.status(200).send(result);
  } catch (err) {
    next(ErrorService.internal(err.message));
  }
};

const getRecentlyViewedProducts = async (req, res, next) => {
  try {
    const { error } = validateGetRecentlyViewedProductIds(req.body);
    if (error) {
      next(ErrorService.badRequest(error.details[0].message));
      return;
    }

    const result = await findRecentlyViewedProducts(req.body.productIds);

    logger.info(`Attempt on ${req.method} ${req.originalUrl} is successfull`);

    res.status(200).send(result);
  } catch (err) {
    next(ErrorService.internal(err.message));
  }
};

const getProductsForSellerReviewsFilter = async (req, res, next) => {
  try {
    if (!req.seller) {
      throw new Error('Missing auth middleware call before controller function');
    }

    const result = await findProductsForReviewsFilter(req.seller._id);

    logger.info(`Attempt on ${req.method} ${req.originalUrl} is successfull`);

    res.status(200).send(result);
  } catch (err) {
    next(ErrorService.internal(err.message));
  }
};

const getProductsForSellerInSellerPage = async (req, res, next) => {
  try {
    const result = await findProductsForSellerInSellerPage(req.body);

    logger.info(`Attempt on ${req.method} ${req.originalUrl} is successfull`);

    res.status(200).send(result);
  } catch (err) {
    next(ErrorService.internal(err.message));
  }
};

module.exports = {
  addProduct,
  getProductsForSeller,
  modifyProduct,
  getProducts,
  getProduct,
  getRelatedProducts,
  getRelatedProductsFromArray,
  getRecentlyViewedProducts,
  getProductsForSellerReviewsFilter,
  getProductsForSellerInSellerPage,
};
