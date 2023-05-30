const express = require('express');
const { authBuyer } = require('../middlewares/buyer');
const { sendMessagetoSeller, getMessageLog, getChat } = require('../controllers/message_controller');

module.exports = () => {
  const router = express.Router();

  router.post('/send-to-seller', authBuyer, sendMessagetoSeller);
  router.post('/all-messages', authBuyer, getMessageLog);
  router.post('/chat', authBuyer, getChat);

  return router;
};
