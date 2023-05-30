const Joi = require('joi');

const buyNowValidation = (data) => {
  const userDetailsSchema = Joi.object({
    billingAdd: Joi.object({
      addLine1: Joi.string().trim().required(),
      addLine2: Joi.string().allow(''),
      city: Joi.string().trim().required(),
      district: Joi.string().trim().required(),
      zip: Joi.string().trim().required(),
      country: Joi.string().trim().required(),
    }).required(),
    shippingAdd: Joi.object({
      addLine1: Joi.string().trim().required(),
      addLine2: Joi.string().allow(''),
      city: Joi.string().trim().required(),
      district: Joi.string().trim().required(),
      zip: Joi.string().trim().required(),
      country: Joi.string().trim().required(),
    }).required(),
    firstName: Joi.string().trim().required(),
    lastName: Joi.string().trim().required(),
    email: Joi.string().trim().required().email(),
    phoneNumber: Joi.string().allow(''),
  }).required();

  const buyNowSchema = Joi.object({
    productId: Joi.objectId().required(),
    amount: Joi.number().required(),
    store: Joi.string().trim().required(),
    quantity: Joi.number().required(),
    variantCombo: Joi.array(),
    userDetails: userDetailsSchema.required(),
    variantComboId: Joi.string().trim(),
  });

  return buyNowSchema.validate(data);
};

module.exports = {
  buyNowValidation,
};
