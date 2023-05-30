const jwt = require('jsonwebtoken');
const { logger } = require('../utils/logger');
const ErrorService = require('../services/ErrorService');
const AdminService = require('../services/AdminService');
const { ERR_TOKEN_EXPIRED, INVALID_TOKEN } = require('../constants/error_codes');
const {
  UNAUTHORIZED,
} = require('../constants/http_codes');
const { TYPE_SP_ADMIN, TYPE_ADMIN } = require('../constants/user_types');

async function authSuperAdmin(req, res, next) {
  try {
    const token = req.header('x-authToken');

    if (!token) {
      next(new ErrorService(401, 'Unauthorized access', UNAUTHORIZED));
      return;
    }

    const verified = jwt.verify(token, process.env.TOKEN_SECRET);

    if (!verified.id || !verified.type || verified.type !== TYPE_SP_ADMIN) {
      next(new ErrorService(401, 'Unauthorized access', UNAUTHORIZED));
      return;
    }

    req.auth = true;

    logger.info(`${verified.id} authorized for ${req.method} ${req.originalUrl}`);

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

async function authAdmins(req, res, next) {
  try {
    const token = req.header('x-authToken');

    if (!token) {
      next(new ErrorService(401, 'Unauthorized access', UNAUTHORIZED));
      return;
    }

    const verified = jwt.verify(token, process.env.TOKEN_SECRET);

    if (!verified.id || !verified.type || ![TYPE_SP_ADMIN, TYPE_ADMIN].includes(verified.type)) {
      next(new ErrorService(401, 'Unauthorized access', UNAUTHORIZED));
      return;
    }

    req.auth = true;

    logger.info(`${verified.id} authorized for ${req.method} ${req.originalUrl}`);

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

module.exports = {
  authSuperAdmin,
  authAdmins,
};
