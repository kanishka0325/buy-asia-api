const { MSG_LIMIT_EXCEEDED } = require('../constants/custom_errors');
const ErrorService = require('../services/ErrorService');
const MessageService = require('../services/MessageService');
const { logger } = require('../utils/logger');

const sendMessagetoSeller = async (req, res, next) => {
  try {
    if (!req.buyer) {
      throw new Error('Missing auth middleware call before controller function');
    }

    const messages = await MessageService.getMessageHistory(req.buyer._id, req.body);
    if (messages.length >= 10) {
      next(new ErrorService(405, 'Maximum limit of 10 messages per month exceeded for this seller', MSG_LIMIT_EXCEEDED));
      return;
    }

    const message = await MessageService.create(req.buyer, req.body);
    logger.info(`buyer (${req.buyer._id}) send message to ${req.body.seller}`);

    res.status(200).send({ message });
  } catch (err) {
    next(ErrorService.internal(err.message));
  }
};

const getMessageLog = async (req, res, next) => {
  try {
    if (!req.buyer) {
      throw new Error('Missing auth middleware call before controller function');
    }

    const messages = await MessageService.allMessages(req.buyer._id, req.body);
    res.status(200).send({ messages });
  } catch (err) {
    next(ErrorService.internal(err.message));
  }
};

const getChat = async (req, res, next) => {
  try {
    if (!req.buyer) {
      throw new Error('Missing auth middleware call before controller function');
    }
    const messages = await MessageService.getChat(req.buyer._id, req.body);
    res.status(200).send({ messages });
  } catch (err) {
    next(ErrorService.internal(err.message));
  }
};

module.exports = {
  sendMessagetoSeller,
  getMessageLog,
  getChat,
};
