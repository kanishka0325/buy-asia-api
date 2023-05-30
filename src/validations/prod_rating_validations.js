const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);

const validateAddProdRating = (data) => {
  const schema = Joi.object({
    invoiceRecordId: Joi.objectId().required(),
    rating: Joi.object({
      status: Joi.bool().valid(true),
      value: Joi.number().min(0).max(5).required(),
      feedback: Joi.string().trim().allow(''),
    }),
  });

  return schema.validate(data);
};

module.exports = { validateAddProdRating };
