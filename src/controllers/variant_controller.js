const ErrorService = require('../services/ErrorService');
const { logger } = require('../utils/logger');
const { get } = require('../services/variant_service');

const getVariants = async (req, res, next) => {
  try {
    // if (!req.sellerId) {
    //   throw new Error('Missing auth middleware call before controller function');
    // }
    const result = await get();

    logger.info(`Attempt on ${req.method} ${req.originalUrl} is successfull`);

    res.status(200).send(result);
  } catch (err) {
    next(ErrorService.internal(err.message));
  }
};

module.exports = {
  getVariants,
};
