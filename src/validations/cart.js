const Joi = require('joi');

const AddItemToTheCartValidation = (data) => {
  const cartSchema = Joi.object({
    buyer: Joi.objectId().required(),
    product: Joi.objectId().required(),
    amount: Joi.number().required(),
    store: Joi.string().trim().required(),
    quantity: Joi.number().required(),
    variantCombo: Joi.array(),
    variantComboId: Joi.string().trim(),
  });

  return cartSchema.validate(data);
};

const validateGetOne = (data) => {
  const schema = Joi.object({
    productId: Joi.objectId().required(),
  });

  return schema.validate(data);
};

const validateRemoveOne = (data) => {
  const schema = Joi.object({
    cartItemId: Joi.objectId().required(),
  });

  return schema.validate(data);
};

const validateUpdateQuantity = (data) => {
  const schema = Joi.object({
    id: Joi.objectId().required(),
    option: Joi.string().required(),
  });

  return schema.validate(data);
};

module.exports = {
  AddItemToTheCartValidation, validateGetOne, validateRemoveOne, validateUpdateQuantity,
};
