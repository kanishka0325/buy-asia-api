/* eslint-disable max-len */
const { lte } = require('lodash');
const CartService = require('../services/CartService');
const ProductService = require('../services/product_service');
const ErrorService = require('../services/ErrorService');
// eslint-disable-next-line import/order
const stripe = require('stripe')(process.env.STRIPE_SECRET);
const { logger } = require('../utils/logger');
const { buyNowValidation } = require('../validations/payment_validations');

const getPaymentAmount = async (req, res, next) => {
  try {
    if (!req.buyer) {
      throw new Error('Missing auth middleware call before controller function');
    }

    const cartItems = await CartService.find(
      req.buyer._id,
    );

    let t = 0.0;
    let s = 0.0;
    let d = 0.0;

    cartItems.forEach((item) => {
      t += (parseFloat(item.amount) * item.quantity);
      s += parseFloat(item.product?.shipmentPrice);
      d += ((parseFloat(item.amount) * item.quantity) / 100) * item.product.discountPercent;
    });

    let total = (t + s) - d;
    total = Math.round((total + Number.EPSILON) * 100) / 100;
    let stripeTotal = total * 100;
    stripeTotal = Math.trunc(stripeTotal);

    logger.info(`buyer (${req.buyer._id}) recieving cart items`);

    const paymentIntent = await stripe.paymentIntents.create({
      currency: 'USD',
      amount: stripeTotal,
      automatic_payment_methods: {
        enabled: true,
      },
    });

    res.send({ clientSecret: paymentIntent.client_secret, amount: total });
  } catch (err) {
    next(ErrorService.internal(err.message));
  }
};

const getPaymentAmountForBuyNow = async (req, res, next) => {
  try {
    if (!req.buyer) {
      throw new Error('Missing auth middleware call before controller function');
    }

    const { error } = buyNowValidation(req.body);

    if (error) {
      next(ErrorService.badRequest(error.details[0].message));
      return;
    }

    const product = await ProductService.findOne(req.body.productId);

    const t = parseFloat(req.body.amount) * req.body.quantity;
    const s = parseFloat(product.shipmentPrice);
    const d = parseFloat((req.body.amount / 100) * product.discountPercent) * req.body.quantity;

    let total = (t + s) - d;
    total = Math.round((total + Number.EPSILON) * 100) / 100;
    let stripeTotal = total * 100;
    stripeTotal = Math.trunc(stripeTotal);

    logger.info(`buyer (${req.buyer._id}) recieving cart items`);

    const paymentIntent = await stripe.paymentIntents.create({
      currency: 'USD',
      amount: stripeTotal,
      automatic_payment_methods: {
        enabled: true,
      },
    });

    res.send({ clientSecret: paymentIntent.client_secret, amount: total });
  } catch (err) {
    next(ErrorService.internal(err.message));
  }
};

module.exports = { getPaymentAmount, getPaymentAmountForBuyNow };
