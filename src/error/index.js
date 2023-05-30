const multer = require('multer');
const { BAD } = require('../constants/http_codes');
const ErrorService = require('../services/ErrorService');
const { logger } = require('../utils/logger');

function apiErrorHandler(err, req, res, next) {
  // console.error(err);

  if (err instanceof ErrorService) {
    res.status(err.code).json({ message: err.message, type: err.type });
    logger.error(`${req.method} ${req.originalUrl} ${err.type}, status: ${err.code}, message:${err.message}`);
    return;
  }

  if (err instanceof multer.MulterError) {
    res.status(400).json({ message: err.message, type: BAD });
    logger.error(`${req.method} ${req.originalUrl} ${BAD}, status: 400, message:${err.message}`);
    return;
  }

  res.status(500).json(err);
}

module.exports = apiErrorHandler;
