const { logger } = require('../utils/logger');

function requestLogger(req, res, next) {
  logger.info(`request: ${req.method} ${req.url}`);
  next();
}

module.exports = requestLogger;
