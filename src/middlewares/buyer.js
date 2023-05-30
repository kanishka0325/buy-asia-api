const jwt = require('jsonwebtoken');
const { USER_NF } = require('../constants/custom_errors');
const { ERR_TOKEN_EXPIRED, INVALID_TOKEN } = require('../constants/error_codes');
const { UNAUTHORIZED } = require('../constants/http_codes');
const BuyerService = require('../services/BuyerService');
const ErrorService = require('../services/ErrorService');
const { logger } = require('../utils/logger');

async function authBuyer(req, res, next) {
  try {
    const token = req.header('x-authToken');

    if (!token) {
      next(new ErrorService(401, 'Unauthorized access', UNAUTHORIZED));
      return;
    }

    const verified = jwt.verify(token, process.env.TOKEN_SECRET);

    if (!verified.id) {
      next(new ErrorService(401, 'Unauthorized access', UNAUTHORIZED));
      return;
    }

    const buyer = await BuyerService.find(verified.id);

    if (!buyer) {
      next(new ErrorService(404, 'Buyer not found', USER_NF));
      return;
    }

    req.buyer = buyer;

    logger.info(`${verified._id} authorized for ${req.method} ${req.originalUrl}`);

    next();
  } catch (err) {
    if (err.name === ERR_TOKEN_EXPIRED) {
      next(new ErrorService(401, 'Token expired', ERR_TOKEN_EXPIRED));
    } else if (err.name === INVALID_TOKEN) {
      next(new ErrorService(401, 'Invalid token', INVALID_TOKEN));
    } else {
      next(ErrorService.internal(err.message));
    }
  }
}

module.exports = {
  authBuyer,
};
