const Joi = require('joi');
const { MUST_HAVE_LETTERS } = require('../constants/regex');
const { STATUS_ACTIVE, STATUS_INACTIVE } = require('../constants/status');
Joi.objectId = require('joi-objectid')(Joi);

const method = (value, helpers) => {
  for (let i = value.length - 1; i >= 0; i--) {
    if (i >= 1) {
      const h = i - 1;
      if (value[i].variantCombo.length !== value[h].variantCombo.length) {
        throw new Error('variantCombo length must be same for every element');
      }
    }
  }

  const variantComboLength = value[0].variantCombo.length;

  for (let i = value.length - 1; i >= 0; i--) {
    if (i >= 1) {
      const h = i - 1;
      for (let j = variantComboLength - 1; j >= 0; j--) {
        if (value[i].variantCombo[j].variant !== value[h].variantCombo[j].variant) {
          throw new Error('variant key\'s value in same indexed objects must be equal');
        }
      }
    }
  }

  return value;
};

const variantSchema = Joi.object({
  _id: Joi.objectId(),
  variant: Joi.string().required(),
  value: Joi.string().required(),
});

const variantComboSchema = Joi.object({
  _id: Joi.objectId(),
  variantCombo: Joi.array()
    .items(variantSchema).unique('variant'),
  price: Joi.number().positive().required(),
  qty: Joi.number().positive().allow(0).required(),
});

const keyValPairSchema = Joi.object({
  _id: Joi.objectId(),
  key: Joi.string().required().regex(MUST_HAVE_LETTERS),
  value: Joi.string().required(),
});

const specSchema = Joi.object({
  _id: Joi.objectId(),
  title: Joi.string().required().regex(MUST_HAVE_LETTERS),
  keyValPairs: Joi.array()
    .items(keyValPairSchema).unique('key').min(1),
});

const validateAdd = (data) => {
  const schema = Joi.object({
    code: Joi.string().required().regex(MUST_HAVE_LETTERS),
    title: Joi.string().required().regex(MUST_HAVE_LETTERS),
    prodCategory: Joi.objectId().required(),
    prodSubCategory: Joi.objectId().required(),
    prodGroup: Joi.objectId().required(),
    prodBrand: Joi.objectId().required(),
    desc: Joi.string().required(),
    discountPercent: Joi.number().positive().allow(0).max(100),
    shipmentPrice: Joi.number().positive().allow(0),
    variantCombos: Joi.array()
      .items(variantComboSchema).min(1).custom(method, 'custom validation'),
    imageUrls: Joi.array().min(1),
    videoUrl: Joi.string(),
    specs: Joi.array()
      .items(specSchema).unique('title').min(1),
  });

  return schema.validate(data);
};

const validateGetBySeller = (data) => {
  const schema = Joi.object({
    skip: Joi.number().required(),
    limit: Joi.number().required(),
    search: Joi.string().allow('', null),
    catId: Joi.objectId().allow('', null),
    subCatId: Joi.objectId().allow('', null),
    groupId: Joi.objectId().allow('', null),
    brandId: Joi.objectId().allow('', null),
    title: Joi.string().trim().valid('asc', 'desc', '', null),
    createdAt: Joi.string().trim().when('title', {
      is: Joi.valid('', null),
      then: Joi.valid('asc', 'desc', '', null),
      otherwise: Joi.valid('', null),
    }),
  });

  return schema.validate(data);
};

const validateModify = (data) => {
  const schema = Joi.object({
    id: Joi.objectId().required(),
    upBody: Joi.object().keys({
      code: Joi.string().regex(MUST_HAVE_LETTERS),
      title: Joi.string().regex(MUST_HAVE_LETTERS),
      prodCategory: Joi.objectId(),
      prodSubCategory: Joi.objectId().when('prodCategory', {
        is: Joi.exist(),
        then: Joi.required(),
        otherwise: Joi.forbidden(),
      }),
      prodGroup: Joi.objectId().when('prodSubCategory', {
        is: Joi.exist(),
        then: Joi.required(),
        otherwise: Joi.forbidden(),
      }),
      prodBrand: Joi.objectId().when('prodCategory', {
        is: Joi.exist(),
        then: Joi.required(),
        otherwise: Joi.forbidden(),
      }),
      desc: Joi.string(),
      discountPercent: Joi.number().positive().allow(0).max(100),
      shipmentPrice: Joi.number().positive().allow(0),
      variantCombos: Joi.array()
        .items(variantComboSchema).min(1).custom(method, 'custom validation'),
      imageUrls: Joi.array().min(1),
      videoUrl: Joi.string().allow(''),
      specs: Joi.array()
        .items(specSchema).unique('title').min(1),
      status: Joi.string().trim().valid(STATUS_ACTIVE, STATUS_INACTIVE),
    }).required(),
  });

  return schema.validate(data);
};

const validateGet = (data) => {
  const schema = Joi.object({
    skip: Joi.number().required(),
    limit: Joi.number().required(),
    search: Joi.string().allow('', null),
    sortRating: Joi.string().trim().valid('asc', 'desc', '', null),
    min: Joi.number().allow('', null),
    max: Joi.when('min', {
      is: Joi.number().exist(),
      then: Joi.number().greater(Joi.ref('min')).required(),
      otherwise: Joi.allow('', null),
    }),
    avgRating: Joi.number().min(0).max(5).allow('', null),
    catId: Joi.objectId().allow('', null),
    subCatId: Joi.objectId().allow('', null),
    groupId: Joi.objectId().allow('', null),
    brandId: Joi.objectId().allow('', null),
  });

  return schema.validate(data);
};

const validateGetOne = (data) => {
  const schema = Joi.object({
    productId: Joi.objectId().required(),
  });

  return schema.validate(data);
};

const validateGetRelatedProducts = (data) => {
  const schema = Joi.object({
    prodGroup: Joi.objectId().required(),
  });

  return schema.validate(data);
};

const validateGetRelatedProductsFromArray = (data) => {
  const schema = Joi.object({
    prodGroup: Joi.array().required(),
  });

  return schema.validate(data);
};

const validateGetRecentlyViewedProductIds = (data) => {
  const schema = Joi.object({
    productIds: Joi.array().required(),
  });

  return schema.validate(data);
};

module.exports = {
  validateAdd,
  validateGetBySeller,
  validateModify,
  validateGet,
  validateGetOne,
  validateGetRelatedProducts,
  validateGetRelatedProductsFromArray,
  validateGetRecentlyViewedProductIds,
};
