const Joi = require('joi');

const pageNumberValidation = (data) => {
  const pagNumberSchema = Joi.object({
    page: Joi.number().required(),
  });

  return pagNumberSchema.validate(data);
};

const updateInvoiceRecordStatusValidation = (data) => {
  const updatingSchema = Joi.object({
    id: Joi.string().required(),
    status: Joi.string().required(),
  });

  return updatingSchema.validate(data);
};

module.exports = {
  pageNumberValidation, updateInvoiceRecordStatusValidation,
};
