const ErrorService = require('../services/ErrorService');
const ReportService = require('../services/reportService');
const { logger } = require('../utils/logger');

const productForGroup = async (req, res, next) => {
  try {
    if (!req.seller) {
      throw new Error('Missing auth middleware call before controller function');
    }
    const records = await ReportService.findProductsForGroup(req.seller, req.body);
    logger.info(`seller (${req.seller._id}) retrieving products for report generation `);
    res.status(200).send(records);
  } catch (err) {
    next(ErrorService.internal(err.message));
  }
};

const productSellsForCategory = async (req, res, next) => {
  try {
    if (!req.seller) {
      throw new Error('Missing auth middleware call before controller function');
    }
    const records = await ReportService.findInvoicesForSellerWithProducts(req.seller, req.body);
    logger.info(`seller (${req.seller._id}) retrieving invoices for report generation `);
    res.status(200).send(records);
  } catch (err) {
    next(ErrorService.internal(err.message));
  }
};

const categorySelection = async (req, res, next) => {
  try {
    if (!req.seller) {
      throw new Error('Missing auth middleware call before controller function');
    }
    const records = await ReportService.findCategoriesForCategory(req.seller, req.body);
    logger.info(`seller (${req.seller._id}) retrieving categories data for report generation `);
    res.status(200).send(records);
  } catch (err) {
    next(ErrorService.internal(err.message));
  }
};

module.exports = {
  productSellsForCategory,
  categorySelection,
  productForGroup,
};
