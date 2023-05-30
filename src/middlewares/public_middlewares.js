const jwt = require('jsonwebtoken');
const { logger } = require('../utils/logger');
const ErrorService = require('../services/ErrorService');
const { ERR_TOKEN_EXPIRED, INVALID_TOKEN } = require('../constants/error_codes');
const {
  UNAUTHORIZED,
} = require('../constants/http_codes');

const { TYPE_SP_ADMIN, TYPE_ADMIN, TYPE_SELLER } = require('../constants/user_types');

const AdminService = require('../services/AdminService');
const SellerService = require('../services/SellerService');
const { STATUS_ACTIVE } = require('../constants/status');

async function authPublic(req, res, next) {
  try {
    const token = req.header('x-authToken');

    if (!token) {
      next(new ErrorService(401, 'Unauthorized access', UNAUTHORIZED));
      return;
    }

    const verified = jwt.verify(token, process.env.TOKEN_SECRET);

    if (![TYPE_SP_ADMIN, TYPE_ADMIN, TYPE_SELLER].includes(verified.type)) {
      next(new ErrorService(401, 'Unauthorized access', UNAUTHORIZED));
      return;
    }

    let user;

    if ([TYPE_SP_ADMIN, TYPE_ADMIN].includes(verified.type)) {
      user = await AdminService.find(verified.id);
    } else {
      user = await SellerService.find(verified.id);
    }

    if (!user || user.status !== STATUS_ACTIVE) {
      next(new ErrorService(401, 'Unauthorized access', UNAUTHORIZED));
      return;
    }

    req.auth = true;

    logger.info(`${verified.email} authorized for ${req.method} ${req.originalUrl}`);

    next();
  } catch (err) {
    if (err.name === ERR_TOKEN_EXPIRED) {
      next(new ErrorService(401, 'Token expired', ERR_TOKEN_EXPIRED));
      return;
    } if (err.name === INVALID_TOKEN) {
      next(new ErrorService(401, 'Invalid token', INVALID_TOKEN));
      return;
    }
    next(ErrorService.internal(err.message));
  }
}

async function mobileFromToken(req, res, next) {
  try {
    const token = req.header('x-authToken');
    if (!token) {
      next(new ErrorService(401, 'Unauthorized access', UNAUTHORIZED));
      return;
    }
    const verified = jwt.verify(token, process.env.TOKEN_SECRET);
    if (verified.mobile) {
      req.mobile = verified.mobile;
      logger.info(`${verified.mobile} authorized for ${req.method} ${req.originalUrl}`);
      next();
    } else {
      next(new ErrorService(401, 'Invalid token', UNAUTHORIZED));
      return;
    }
  } catch (err) {
    if (err.name === ERR_TOKEN_EXPIRED) {
      next(new ErrorService(401, 'Token expired', UNAUTHORIZED));
      return;
    }
    next(ErrorService.internal(err.message));
  }
}

module.exports = {
  authPublic,
  mobileFromToken,
};
