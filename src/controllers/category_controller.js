const { PROD_CAT_NF, PROD_SUB_CAT_NF, PROD_GROUP_NF } = require('../constants/custom_errors');
const ErrorService = require('../services/ErrorService');
const CategoryService = require('../services/category_service');
const { logger } = require('../utils/logger');
const {
  validateAddCategory,
  validateAddSubCategory,
  validateAddGroup,
  validateGetCategories,
  validateModifyCategory,
} = require('../validations/category');
const { STATUS_INACTIVE, STATUS_ACTIVE } = require('../constants/status');

const addProdCat = async (req, res, next) => {
  try {
    const { error } = validateAddCategory(req.body);

    if (error) {
      next(ErrorService.badRequest(error.details[0].message));
      return;
    }

    const result = await CategoryService.addCategory(req.body);

    logger.info(`Created new document (${result._id}) in prod_categories collection`);

    res.status(200).send(result);
  } catch (err) {
    next(ErrorService.internal(err.message));
  }
};

const addProdSubCat = async (req, res, next) => {
  try {
    const { error } = validateAddSubCategory(req.body);

    if (error) {
      next(ErrorService.badRequest(error.details[0].message));
      return;
    }

    const category = await CategoryService.findCategory({ _id: req.body.prodCategory });

    if (!category) {
      next(new ErrorService(404, 'Product Category is not exist', PROD_CAT_NF));
      return;
    }

    const result = await CategoryService.addSubCategory(req.body);

    logger.info(`Created new document (${result._id}) in prod_sub_categories collection`);

    res.status(200).send(result);
  } catch (err) {
    next(ErrorService.internal(err.message));
  }
};

const addProdGroup = async (req, res, next) => {
  try {
    const { error } = validateAddGroup(req.body);

    if (error) {
      next(ErrorService.badRequest(error.details[0].message));
      return;
    }

    const subCategory = await CategoryService
      .findSubCategory({ _id: req.body.prodSubCategory }, false);

    if (!subCategory) {
      next(new ErrorService(404, 'Product Sub Category is not exist', PROD_SUB_CAT_NF));
      return;
    }

    if (subCategory.aot !== req.body.aot) {
      next(ErrorService.badRequest('Product group aot must be same as the sub-category aot'));
      return;
    }

    const result = await CategoryService.addGroup(req.body);

    logger.info(`Created new document (${result._id}) in prod_groups collection`);

    res.status(200).send(result);
  } catch (err) {
    next(ErrorService.internal(err.message));
  }
};

const getProdCats = async (req, res, next) => {
  try {
    if (!req.auth && !req.seller) {
      throw new Error('Missing auth middleware call before controller function');
    }

    const result = await CategoryService.getCategories();

    logger.info(`Attempt on ${req.method} ${req.originalUrl} is successfull`);

    res.status(200).send(result);
  } catch (err) {
    next(ErrorService.internal(err.message));
  }
};

const getProdSubCats = async (req, res, next) => {
  try {
    if (!req.auth && !req.seller) {
      throw new Error('Missing auth middleware call before controller function');
    }

    const { error } = validateGetCategories(req.query);

    if (error) {
      next(ErrorService.badRequest(error.details[0].message));
      return;
    }

    const category = await CategoryService.findCategory({ _id: req.query.id });

    if (!category || category.status !== STATUS_ACTIVE) {
      next(new ErrorService(404, 'Product Category is not exist', PROD_CAT_NF));
      return;
    }

    const result = await CategoryService.getSubCategories(req.query.id);

    logger.info(`Attempt on ${req.method} ${req.originalUrl} is successfull`);

    res.status(200).send(result);
  } catch (err) {
    next(ErrorService.internal(err.message));
  }
};

const getProdGroups = async (req, res, next) => {
  try {
    if (!req.auth && !req.seller) {
      throw new Error('Missing auth middleware call before controller function');
    }

    const { error } = validateGetCategories(req.query);

    if (error) {
      next(ErrorService.badRequest(error.details[0].message));
      return;
    }

    const subCategory = await CategoryService
      .findSubCategory({ _id: req.query.id }, true);

    if (!subCategory || subCategory.status !== STATUS_ACTIVE
      || subCategory.prodCategory.status !== STATUS_ACTIVE) {
      next(new ErrorService(404, 'Product Sub Category is not exist', PROD_SUB_CAT_NF));
      return;
    }

    const result = await CategoryService.getGroups(req.query.id);

    logger.info(`Attempt on ${req.method} ${req.originalUrl} is successfull`);

    res.status(200).send(result);
  } catch (err) {
    next(ErrorService.internal(err.message));
  }
};

const modifyProdCat = async (req, res, next) => {
  try {
    if (!req.auth) {
      throw new Error('Missing auth middleware call before controller function');
    }

    const { error } = validateModifyCategory(req.body);

    if (error) {
      next(ErrorService.badRequest(error.details[0].message));
      return;
    }

    const category = await CategoryService.findCategory({ _id: req.body.id });

    if (!category) {
      next(new ErrorService(404, 'Product Category is not exist', PROD_CAT_NF));
      return;
    }

    const result = await CategoryService.modifyCategory(req.body.id, req.body.upBody);

    logger.info(`Modified document (${result._id}) of prod_categories collection`);

    res.status(200).send(result);
  } catch (err) {
    next(ErrorService.internal(err.message));
  }
};

const modifyProdSubCat = async (req, res, next) => {
  try {
    if (!req.auth) {
      throw new Error('Missing auth middleware call before controller function');
    }

    const { error } = validateModifyCategory(req.body);

    if (error) {
      next(ErrorService.badRequest(error.details[0].message));
      return;
    }

    const subCategory = await CategoryService
      .findSubCategory({ _id: req.body.id }, false);

    if (!subCategory) {
      next(new ErrorService(404, 'Product Sub Category is not exist', PROD_SUB_CAT_NF));
      return;
    }

    const result = await CategoryService.modifySubCategory(req.body.id, req.body.upBody);

    logger.info(`Modified document (${result._id}) of prod_sub_categories collection`);

    res.status(200).send(result);
  } catch (err) {
    next(ErrorService.internal(err.message));
  }
};

const modifyProdGroup = async (req, res, next) => {
  try {
    if (!req.auth) {
      throw new Error('Missing auth middleware call before controller function');
    }

    const { error } = validateModifyCategory(req.body);

    if (error) {
      next(ErrorService.badRequest(error.details[0].message));
      return;
    }

    const group = await CategoryService.findGroup({ _id: req.body.id }, false);

    if (!group) {
      next(new ErrorService(404, 'Product group is not exist', PROD_GROUP_NF));
      return;
    }

    const result = await CategoryService.modifyGroup(req.body.id, req.body.upBody);

    logger.info(`Modified document (${result._id}) of prod_groups collection`);

    res.status(200).send(result);
  } catch (err) {
    next(ErrorService.internal(err.message));
  }
};

const getAll = async (req, res, next) => {
  try {
    const result = await CategoryService.retrieveAll();
    res.status(200).send(result);
    logger.info(`Attempt on ${req.method} ${req.originalUrl} is successfull`);
  } catch (err) {
    next(ErrorService.internal(err.message));
  }
};

const getCategoriesForPublic = async (req, res, next) => {
  try {
    const result = await CategoryService.findCategoriesForPublic(req.params.sellerId);

    logger.info(`Attempt on ${req.method} ${req.originalUrl} is successfull`);

    res.status(200).send(result);
  } catch (err) {
    next(ErrorService.internal(err.message));
  }
};

module.exports = {
  addProdCat,
  addProdSubCat,
  addProdGroup,
  getProdCats,
  getProdSubCats,
  getProdGroups,
  modifyProdCat,
  modifyProdSubCat,
  modifyProdGroup,
  getAll,
  getCategoriesForPublic,
};
