const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);
const { STATUS_ACTIVE, STATUS_INACTIVE } = require('../constants/status');

const validateAddCategory = (data) => {
  const schema = Joi.object({
    name: Joi.string().trim().required(),
    imageUrl: Joi.string().trim().required(),
  });

  return schema.validate(data);
};

const validateAddSubCategory = (data) => {
  const schema = Joi.object({
    prodCategory: Joi.objectId().required(),
    name: Joi.string().trim().required(),
    imageUrl: Joi.string().trim(),
    aot: Joi.bool().required(),
  });

  return schema.validate(data);
};

const validateAddGroup = (data) => {
  const schema = Joi.object({
    prodSubCategory: Joi.objectId().required(),
    name: Joi.string().trim().required(),
    imageUrl: Joi.string().trim().required(),
    aot: Joi.bool().required(),
  });

  return schema.validate(data);
};

const validateGetCategories = (data) => {
  const schema = Joi.object({
    id: Joi.objectId().required(),
  });

  return schema.validate(data);
};

const validateModifyCategory = (data) => {
  const schema = Joi.object({
    id: Joi.objectId().required(),
    upBody: Joi.object().keys({
      name: Joi.string().trim(),
      imageUrl: Joi.string().trim(),
      status: Joi.string().trim().valid(STATUS_ACTIVE, STATUS_INACTIVE),
    }).required(),
  });

  return schema.validate(data);
};

module.exports = {
  validateAddCategory,
  validateAddSubCategory,
  validateAddGroup,
  validateGetCategories,
  validateModifyCategory,
};
