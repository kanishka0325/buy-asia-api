const { createLogger, format, transports } = require('winston');

const logger = createLogger({
  transports:
    new transports.File({
      filename: 'logs/main.log',
      format: format.combine(
        format.timestamp({ format: 'MMM-DD-YYYY HH:mm:ss' }),
        format.printf((info) => `${info.level}: ${[info.timestamp]}: ${info.message}`),
      ),
    }),
});

const loggerExtend = createLogger({
  transports: [
    new transports.Console({
      format: format.combine(
        format.colorize(),
        format.timestamp({ format: 'MMM-DD-YYYY HH:mm:ss' }),
        format.printf((info) => `${info.level}: ${[info.timestamp]}: ${info.message}`),
      ),
    }),
    new transports.File({
      filename: 'logs/main.log',
      format: format.combine(
        format.timestamp({ format: 'MMM-DD-YYYY HH:mm:ss' }),
        format.align(),
        format.printf((info) => `${info.level}: ${[info.timestamp]}:${info.message}`),
      ),
    })],
});

module.exports = { logger, loggerExtend };
