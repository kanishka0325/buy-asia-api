const ErrorService = require('../services/ErrorService');
const { logger } = require('../utils/logger');
const WishListService = require('../services/WishListService');
const {
  AddItemToTheWishListValidation, FindItemValidation, ParameterValidation, pageNumberValidation,
} = require('../validations/wishList');

const addItemToWishList = async (req, res, next) => {
  try {
    if (!req.buyer) {
      throw new Error('Missing auth middleware call before controller function');
    }

    const { error } = AddItemToTheWishListValidation(req.body);

    if (error) {
      next(ErrorService.badRequest(error.details[0].message));
      return;
    }

    const wishListItem = await WishListService.findById(req.body.product, req.buyer._id);

    if (wishListItem) {
      logger.info(`buyer (${req.buyer._id}) has already this item in the wishlist (${req.body.product})`);
      res.status(200).send({ result: wishListItem, message: 'Item already in the Wishlist' });
    }

    const addResult = await WishListService.add(req.body.product, req.body.store, req.buyer._id);

    logger.info(`buyer ${req.buyer._id} added ${req.body.product} to the wishlist`);

    res.status(200).send({ result: wishListItem, addResult, message: 'Item added to the Wishlist Successfully!' });
  } catch (err) {
    next(ErrorService.internal(err.message));
  }
};

const findItemInTheWishList = async (req, res, next) => {
  try {
    if (!req.buyer) {
      throw new Error('Missing auth middleware call before controller function');
    }

    const { error } = FindItemValidation(req.params);

    if (error) {
      next(ErrorService.badRequest(error.details[0].message));
      return;
    }

    const result = await WishListService.findById(req.params.productId, req.buyer._id);

    logger.info(`buyer (${req.buyer._id}) checking this item (${req.params.productId}) in the wishlist `);

    res.status(200).send(result);
  } catch (err) {
    next(ErrorService.internal(err.message));
  }
};

const getAllTheItemsInWishList = async (req, res, next) => {
  try {
    if (!req.buyer) {
      throw new Error('Missing auth middleware call before controller function');
    }

    const result = await WishListService.findAll(req.buyer._id);

    logger.info(`buyer (${req.buyer._id}) retrieving all the items in the wishlist `);

    res.status(200).send(result);
  } catch (err) {
    next(ErrorService.internal(err.message));
  }
};

const deleteItemInWishList = async (req, res, next) => {
  try {
    if (!req.buyer) {
      throw new Error('Missing auth middleware call before controller function');
    }

    const { error } = ParameterValidation(req.params);

    if (error) {
      next(ErrorService.badRequest(error.details[0].message));
      return;
    }

    const result = await WishListService.deleteById(req.params.id);

    logger.info(`buyer (${req.buyer._id}) deleting item (${req.params.id}) in the wishlist `);

    res.status(200).send(result);
  } catch (err) {
    next(ErrorService.internal(err.message));
  }
};

const getPaginationCount = async (req, res, next) => {
  try {
    if (!req.buyer) {
      throw new Error('Missing auth middleware call before controller function');
    }

    const WishlistItems = await WishListService.findAll(req.buyer._id);

    const count = WishListService.sepratingForPagination(WishlistItems);

    logger.info(`buyer (${req.buyer._id}) retreiving reviews count`);

    res.status(200).send({ count });
  } catch (err) {
    next(ErrorService.internal(err.message));
  }
};

const getPaginationDocuments = async (req, res, next) => {
  try {
    if (!req.buyer) {
      throw new Error('Missing auth middleware call before controller function');
    }

    const { error } = pageNumberValidation(req.params);

    if (error) {
      next(ErrorService.badRequest(error.details[0].message));
      return;
    }

    let WishlistItems = await WishListService.findAll(req.buyer._id);

    WishlistItems = await WishListService.getPaginationWishList(req.params.page, WishlistItems);

    logger.info(`buyer (${req.buyer._id}) invoice details for related page`);

    res.status(200).send({ WishlistItems });
  } catch (err) {
    next(ErrorService.internal(err.message));
  }
};

module.exports = {
  addItemToWishList,
  findItemInTheWishList,
  getAllTheItemsInWishList,
  deleteItemInWishList,
  getPaginationCount,
  getPaginationDocuments,
};
