const Joi = require('joi');
const { MOBILE_REGEX } = require('../constants/regex');

const registrationValidation = (data) => {
  const buyerSchema = Joi.object({
    mobile: Joi.string().trim().required().regex(MOBILE_REGEX)
      .messages({
        'string.empty': 'mobile cannot be an empty field',
        'any.required': 'mobile is a required field',
        'string.pattern.base': 'invalid mobile number',
      }),
  });

  return buyerSchema.validate(data);
};

const personalDetailsValidation = (data) => {
  const buyerSchema = Joi.object({
    firstName: Joi.string().trim().required()
      .messages({
        'string.empty': 'First Name cannot be an empty field',
        'any.required': 'First Name is a required field',

      }),
    lastName: Joi.string().trim().required()
      .messages({
        'string.empty': 'Last Name cannot be an empty field',
        'any.required': 'Last Name is a required field',
      }),
    email: Joi.string().trim().required().email()
      .messages({
        'string.empty': 'email cannot be an empty field',
        'any.required': 'email is a required field',
        'string.email': 'email must be a valid email',
      }),
    contactMobile: Joi.string().allow(''),
  });

  return buyerSchema.validate(data);
};

const validateAddressDetails = (data) => {
  const addressSchema = Joi.object({
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
    status: Joi.bool().required(),
  }).required();

  const buyerSchema = Joi.object({
    address: addressSchema.required(),
  });

  return buyerSchema.validate(data);
};

const validateLogin = (data) => {
  const schema = Joi.object({
    mobile: Joi.string().trim().required(),
    password: Joi.string().trim().required(),
  });

  return schema.validate(data);
};

module.exports = {
  registrationValidation,
  personalDetailsValidation,
  validateAddressDetails,
  validateLogin,
};
