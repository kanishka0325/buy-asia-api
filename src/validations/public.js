const Joi = require('joi');

const verifyOtpValidation = (data) => {
  const sellerSchema = Joi.object({
    verifyKey: Joi.string().required()
      .messages({
        'string.empty': 'verifyKey cannot be an empty field',
        'any.required': 'verifyKey is a required field',
      }),
    otp: Joi.string().required().min(6).max(6)
      .regex(/^[0-9]*$/)
      .messages({
        'string.empty': 'otp cannot be an empty field',
        'any.required': 'otp is a required field',
        'string.min': 'Must contain {#limit} digits',
        'string.max': 'Allow only {#limit} digits',
        'string.pattern.base': 'numbers are only allowed',
      }),
  });

  return sellerSchema.validate(data);
};

const validatePassword = (data) => {
  const schema = Joi.object({
    password: Joi.string().trim()
      .required()
      .min(8)
      .regex(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[^\w\s]).{8,30}$/)
      .messages({
        'string.empty': 'Password cannot be an empty field',
        'any.required': 'Password is a required field',
        'string.min': 'Password must contain at least {#limit} characters',
        'string.pattern.base': 'Password must contain at least, 1 Uppercase letter, 1 lowercase letter, 1 special character, and 1 digit',
      }),
  });

  return schema.validate(data);
};

const getOtpValidation = (data) => {
  const userSchema = Joi.object({
    mobile: Joi.string().trim().required(),
  });

  return userSchema.validate(data);
};

const validateOtp = (data) => {
  const userSchema = Joi.object({
    verifyKey: Joi.string().required(),
    otp: Joi.string().required().max(6).regex(/^[0-9]*$/),
  });
  return userSchema.validate(data);
};

module.exports = {
  verifyOtpValidation,
  validatePassword,
  getOtpValidation,
  validateOtp,
};
