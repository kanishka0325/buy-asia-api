const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);
const {
  STATUS_ACTIVE, STATUS_INACTIVE, STATUS_APPROVED, STATUS_REJECTED,
} = require('../constants/status');

const validateAddBrand = (data) => {
  const schema = Joi.object({
    prodCategory: Joi.objectId().required(),
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

const validateProceed = (data) => {
  const schema = Joi.object({
    id: Joi.objectId().required(),
    upBody: Joi.object().keys({
      status: Joi.string().trim().valid(STATUS_APPROVED, STATUS_REJECTED).required(),
      rejectReason: Joi.when('status', {
        is: STATUS_REJECTED,
        then: Joi.string().trim().required(),
        otherwise: Joi.forbidden(),
      }),
    }).required(),
  });

  return schema.validate(data);
};

module.exports = {
  validateAddBrand,
  validateGet,
  validateProceed,
};
