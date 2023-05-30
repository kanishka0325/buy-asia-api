const jwt = require('jsonwebtoken');
const SellerService = require('../services/SellerService');
const ErrorService = require('../services/ErrorService');
const {
  STATUS_ACTIVE,
  STATUS_INITIATED,
  STATUS_PRO_DONE,
  STATUS_PENDING_APR,
} = require('../constants/status');
const {
  UNAUTHORIZED,
} = require('../constants/http_codes');

const {
  NOT_ACTIVE,
  DUP_ACTION,
  PR_NOT_INITIATE,
  USER_NF,
} = require('../constants/custom_errors');
const { ERR_TOKEN_EXPIRED, INVALID_TOKEN } = require('../constants/error_codes');
const { logger } = require('../utils/logger');

async function authSeller(req, res, next) {
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

    const seller = await SellerService.find(verified.id);

    if (!seller) {
      next(new ErrorService(401, 'Unauthorized access', UNAUTHORIZED));
      return;
    }

    if (seller.status !== STATUS_ACTIVE) {
      next(new ErrorService(401, 'Seller account is not activated', NOT_ACTIVE));
      return;
    }

    // req.sellerId = seller._id;
    req.seller = seller;

    logger.info(`${verified.id} authorized for ${req.method} ${req.originalUrl}`);

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

async function authAddInfo(req, res, next) {
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

    const seller = await SellerService.find(verified.id);

    if (!seller) {
      next(new ErrorService(404, 'Seller not found', USER_NF));
      return;
    }

    if (seller.status !== STATUS_PENDING_APR) {
      next(new ErrorService(401, 'Seller account is not activated', NOT_ACTIVE));
      return;
    }

    if (seller.prStatus === STATUS_PRO_DONE) {
      next(new ErrorService(409, 'You have already performed this step', DUP_ACTION));
      return;
    }

    if (seller.prStatus !== STATUS_INITIATED) {
      next(new ErrorService(405, `Seller profile status is not in ${STATUS_INITIATED} status `, PR_NOT_INITIATE));
      return;
    }

    req.sellerId = seller._id;

    logger.info(`${verified.id} authorized for ${req.method} ${req.originalUrl}`);

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

async function authRefreshSeller(req, res, next) {
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

    const seller = await SellerService.find(verified.id);

    if (!seller) {
      next(new ErrorService(404, 'Seller not found', USER_NF));
      return;
    }

    req.seller = seller;

    logger.info(`${verified.email} authorized for ${req.method} ${req.originalUrl}`);

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
  authAddInfo, authSeller, authRefreshSeller,
};
