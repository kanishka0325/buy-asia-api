const Joi = require('joi');
const { MUST_HAVE_LETTERS, MOBILE_REGEX, ZIP_REGEX } = require('../constants/regex');
const {
  SELLER_TMPLT_FIRST, SELLER_TMPLT_SECOND, SELLER_TMPLT_THIRD, SELLER_TMPLT_FOURTH,
} = require('../constants/seller_templates');
const { STATUS_ACTIVE, STATUS_REJECTED } = require('../constants/status');
Joi.objectId = require('joi-objectid')(Joi);

const initValidation = (data) => {
  const sellerSchema = Joi.object({
    mobile: Joi.string().trim().required().regex(MOBILE_REGEX),
    email: Joi.string().trim().required().email(),
  });

  return sellerSchema.validate(data);
};

const validateLogin = (data) => {
  const schema = Joi.object({
    mobile: Joi.string().trim().required(),
    password: Joi.string().trim().required(),
  });

  return schema.validate(data);
};

const validateInfo = (data) => {
  const basicSchema = Joi.object({
    companyName: Joi.string().trim().required().regex(MUST_HAVE_LETTERS),
    tradeName: Joi.string().trim().required().regex(MUST_HAVE_LETTERS),
    type: Joi.string().trim().required(),
    brno: Joi.string().trim().required().regex(MUST_HAVE_LETTERS),
    // tin: Joi.string().trim().required(),
    logo: Joi.string().trim().required(),
    description: Joi.string().required().max(1000),
  });

  const contactSchema = Joi.object({
    regAddress: Joi.object({
      addLine1: Joi.string().trim().required().regex(MUST_HAVE_LETTERS),
      addLine2: Joi.string().trim().required().regex(MUST_HAVE_LETTERS),
      city: Joi.string().trim().required().regex(MUST_HAVE_LETTERS),
      zip: Joi.string().trim().required().regex(ZIP_REGEX),
      country: Joi.string().trim().required(),
    }).required(),
    contactNums: Joi.array().items(Joi.string().regex(MOBILE_REGEX)).unique().min(1)
      .max(3),
    contactEmail: Joi.string().trim().email().required(),
  });

  const cpSchema = Joi.object({
    cpName: Joi.string().trim().required().regex(MUST_HAVE_LETTERS),
    cpDesignation: Joi.string().trim().required(),
    cpContactNum: Joi.string().required().regex(MOBILE_REGEX),
  });

  const sellerSchema = Joi.object({
    basic: basicSchema.required(),
    contact: contactSchema.required(),
    cp: cpSchema.required(),
  });

  return sellerSchema.validate(data);
};

const validateSetTemplate = (data) => {
  const basicSchema = Joi.object({
    template: Joi.string().trim().required().valid(
      SELLER_TMPLT_FIRST,
      SELLER_TMPLT_SECOND,
      SELLER_TMPLT_THIRD,
      SELLER_TMPLT_FOURTH,
    ),
    cover: Joi.string().trim().required(),
  });

  const sellerSchema = Joi.object({
    basic: basicSchema.required(),
  });

  return sellerSchema.validate(data);
};

const validateTemplateOnly = (data) => {
  const basicSchema = Joi.object({
    template: Joi.string().trim().required().valid(
      SELLER_TMPLT_FIRST,
      SELLER_TMPLT_SECOND,
      SELLER_TMPLT_THIRD,
      SELLER_TMPLT_FOURTH,
    ),

  });
  const sellerSchema = Joi.object({
    basic: basicSchema.required(),
  });
  return sellerSchema.validate(data);
};

const validateGetSellers = (data) => {
  const sellerSchema = Joi.object({
    skip: Joi.number().required(),
    limit: Joi.number().required(),
    from: Joi.date().iso().allow(null, '').max(Date.now()),
    to: Joi.when('from', {
      is: Joi.date().iso(),
      then: Joi.date().iso().min(Joi.ref('from')).max(Date.now()),
      otherwise: Joi.valid(null, ''),
    }),

  });

  return sellerSchema.validate(data);
};

const validateSellerReview = (data) => {
  const upSeller = Joi.object({
    status: Joi.string().trim().required().valid(STATUS_ACTIVE, STATUS_REJECTED),
    rejReason: Joi.when('status', {
      is: Joi.string().valid(STATUS_REJECTED),
      then: Joi.string().trim().required(),
      otherwise: Joi.valid(''),
    }),
  });

  const sellerSchema = Joi.object({
    sellerId: Joi.objectId().required(),
    upSeller,
  });

  return sellerSchema.validate(data);
};

module.exports = {
  initValidation,
  validateLogin,
  validateInfo,
  validateSellerReview,
  validateGetSellers,
  validateSetTemplate,
  validateTemplateOnly,
};
