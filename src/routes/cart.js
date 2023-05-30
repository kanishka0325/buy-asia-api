const express = require('express');
const {
  addItemToTheCart,
  findProductInCart,
  findCartItems,
  removeCartItem,
  updateQuantity,
  findCartItemsAndCount,
} = require('../controllers/cart_controller');
const { authBuyer } = require('../middlewares/buyer');

module.exports = () => {
  const router = express.Router();

  router.post('/add-item-to-cart', authBuyer, addItemToTheCart);
  router.get('/check-item-in-cart/:productId', authBuyer, findProductInCart);
  router.get('/find-cart-items', authBuyer, findCartItems);
  router.get('/get-count-of-cart-items', authBuyer, findCartItemsAndCount);
  router.delete('/remove-cart-item/:cartItemId', authBuyer, removeCartItem);
  router.patch('/update-cart-item', authBuyer, updateQuantity);

  return router;
};
