const express = require('express');
const {
  addItemToWishList,
  findItemInTheWishList,
  getAllTheItemsInWishList,
  deleteItemInWishList,
  getPaginationCount,
  getPaginationDocuments,
} = require('../controllers/wishList_controller');
const { authBuyer } = require('../middlewares/buyer');

module.exports = () => {
  const router = express.Router();

  router.post('/add-item-to-wishlist', authBuyer, addItemToWishList);
  router.get('/check-item-in-wishlist/:productId', authBuyer, findItemInTheWishList);
  router.get('/get-items-in-wishlist', authBuyer, getAllTheItemsInWishList);
  router.delete('/delete-item-in-wishlist/:id', authBuyer, deleteItemInWishList);
  router.get('/get-pagination-count', authBuyer, getPaginationCount);
  router.get('/get-documents-for-pagination/:page', authBuyer, getPaginationDocuments);

  return router;
};
