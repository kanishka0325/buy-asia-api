const CartService = require('../services/CartService');
const {
  AddItemToTheCartValidation, validateGetOne, validateRemoveOne, validateUpdateQuantity,
} = require('../validations/cart');
const ErrorService = require('../services/ErrorService');
const { logger } = require('../utils/logger');

const addItemToTheCart = async (req, res, next) => {
  try {
    if (!req.buyer) {
      throw new Error('Missing auth middleware call before controller function');
    }

    const cartItem = {
      buyer: req.buyer._id.toString(),
      ...req.body,
    };

    const { error } = AddItemToTheCartValidation(cartItem);

    if (error) {
      next(ErrorService.badRequest(error.details[0].message));
      return;
    }

    await CartService.add(
      cartItem,
    );

    const cartItems = await CartService.find(
      req.buyer._id,
    );

    let total = 0;

    cartItems.forEach((item) => {
      // eslint-disable-next-line max-len
      total += ((item.amount * item.quantity - (((item.amount * item.quantity) / 100) * item.product.discountPercent)) + item.product.shipmentPrice);
    });

    total = Math.round((total + Number.EPSILON) * 100) / 100;

    logger.info(`buyer (${req.buyer._id}) added item to the cart`);

    res.status(200).send({ total, items: cartItems.length });
  } catch (err) {
    next(ErrorService.internal(err.message));
  }
};

const findProductInCart = async (req, res, next) => {
  try {
    if (!req.buyer) {
      throw new Error('Missing auth middleware call before controller function');
    }

    const { error } = validateGetOne(req.params);

    if (error) {
      next(ErrorService.badRequest(error.details[0].message));
      return;
    }

    const cartItem = await CartService.findById(req.params.productId, req.buyer._id);

    logger.info(`buyer (${req.buyer._id}) has already this item in the cart (${cartItem._id})`);

    res.status(200).send({ result: cartItem });
  } catch (err) {
    next(ErrorService.internal(err.message));
  }
};

const findCartItems = async (req, res, next) => {
  try {
    if (!req.buyer) {
      throw new Error('Missing auth middleware call before controller function');
    }

    const cartItems = await CartService.find(
      req.buyer._id,
    );

    logger.info(`buyer (${req.buyer._id}) recieving cart items`);

    res.status(200).send(cartItems);
  } catch (err) {
    next(ErrorService.internal(err.message));
  }
};

const findCartItemsAndCount = async (req, res, next) => {
  try {
    if (!req.buyer) {
      throw new Error('Missing auth middleware call before controller function');
    }

    const cartItems = await CartService.findAndCount(
      req.buyer._id,
    );

    logger.info(`buyer (${req.buyer._id}) retrieving count of cart items`);

    res.status(200).send({ count: cartItems });
  } catch (err) {
    next(ErrorService.internal(err.message));
  }
};

const removeCartItem = async (req, res, next) => {
  try {
    if (!req.buyer) {
      throw new Error('Missing auth middleware call before controller function');
    }

    const { error } = validateRemoveOne(req.params);

    if (error) {
      next(ErrorService.badRequest(error.details[0].message));
      return;
    }

    const cartItem = await CartService.delete(
      req.params.cartItemId,
    );

    logger.info(`buyer (${req.buyer._id}) deleted item (${cartItem}) from cart`);

    res.status(200).send(cartItem);
  } catch (err) {
    next(ErrorService.internal(err.message));
  }
};

const updateQuantity = async (req, res, next) => {
  try {
    if (!req.buyer) {
      throw new Error('Missing auth middleware call before controller function');
    }

    const { error } = validateUpdateQuantity(req.body);

    if (error) {
      next(ErrorService.badRequest(error.details[0].message));
      return;
    }

    const cartItem = await CartService.findByIdAndUpdate(
      req.body,
    );

    logger.info(`buyer (${req.buyer._id}) updated quantity of (${cartItem}) from cart`);

    res.status(200).send(cartItem);
  } catch (err) {
    next(ErrorService.internal(err.message));
  }
};

module.exports = {
  addItemToTheCart,
  findProductInCart,
  findCartItems,
  removeCartItem,
  updateQuantity,
  findCartItemsAndCount,
};
