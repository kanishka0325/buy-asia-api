const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);

const validateLogin = (data) => {
  const schema = Joi.object({
    email: Joi.string().required().email(),
    password: Joi.string().trim().required(),
  });

  return schema.validate(data);
};

const validateAddUser = (data) => {
  const schema = Joi.object({
    firstName: Joi.string().trim().required(),
    lastName: Joi.string().trim().required(),
    mobile: Joi.string().trim().allow(''),
    email: Joi.string().required().email(),
  });

  return schema.validate(data);
};

module.exports = { validateLogin, validateAddUser };
