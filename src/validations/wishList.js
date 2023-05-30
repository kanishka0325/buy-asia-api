const Joi = require('joi');

const AddItemToTheWishListValidation = (data) => {
  const wishListSchema = Joi.object({
    product: Joi.objectId().required(),
    store: Joi.string().required(),
  });

  return wishListSchema.validate(data);
};

const FindItemValidation = (data) => {
  const wishListSchema = Joi.object({
    productId: Joi.objectId().required(),
  });

  return wishListSchema.validate(data);
};

const ParameterValidation = (data) => {
  const wishListSchema = Joi.object({
    id: Joi.objectId().required(),
  });

  return wishListSchema.validate(data);
};

const pageNumberValidation = (data) => {
  const pagNumberSchema = Joi.object({
    page: Joi.number().required(),
  });

  return pagNumberSchema.validate(data);
};

module.exports = {
  AddItemToTheWishListValidation, FindItemValidation, ParameterValidation, pageNumberValidation,
};
