const express = require('express');
const {
  sendEmail, awsMail, publishTemplate, updateProducts, awsRawMail, deleteTemplate,
} = require('../controllers/test_controller');

module.exports = () => {
  const router = express.Router();

  router.post('/send-email', awsMail);

  router.post('/publish-template', publishTemplate);

  router.patch('/update-products-brand', updateProducts);

  router.post('/send-email-with-attachment', awsRawMail);

  router.delete('/delete-template', deleteTemplate);

  return router;
};
