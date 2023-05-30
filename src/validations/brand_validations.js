const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);
const { STATUS_ACTIVE, STATUS_INACTIVE } = require('../constants/status');

const validateAddBrand = (data) => {
  const schema = Joi.object({
    categories: Joi.array()
      .items(Joi.objectId()).min(1).unique(),
    name: Joi.string().trim().required(),
    imageUrl: Joi.string().trim().required(),
  });

  return schema.validate(data);
};

const validateGet = (data) => {
  const schema = Joi.object({
    skip: Joi.number().required(),
    limit: Joi.number().required(),
    search: Joi.string().allow('', null),
  });

  return schema.validate(data);
};

const validateModify = (data) => {
  const schema = Joi.object({
    id: Joi.objectId().required(),
    upBody: Joi.object().keys({
      name: Joi.string().trim(),
      imageUrl: Joi.string().trim(),
    }).required(),
  });

  return schema.validate(data);
};

const validateGetByCategory = (data) => {
  const schema = Joi.object({
    catId: Joi.objectId().required(),
  });

  return schema.validate(data);
};

module.exports = {
  validateAddBrand,
  validateGet,
  validateModify,
  validateGetByCategory,
};
