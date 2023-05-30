const WishListModel = require('../models/wishlist_model');

class WishlistService {
  static async add(productId, store, buyerId) {
    const item = await WishListModel.create({ product: productId, store, buyer: buyerId });
    return item;
  }

  static async findById(productId, buyerId) {
    const wishListItem = await WishListModel.findOne({ product: productId, buyer: buyerId });
    if (wishListItem === null) {
      return false;
    }
    return true;
  }

  static async findAll(buyerId) {
    const wishListItems = await WishListModel.find({ buyer: buyerId }).populate('product');
    return wishListItems;
  }

  static async deleteById(id) {
    const result = await WishListModel.findByIdAndDelete(id);
    return result;
  }

  static sepratingForPagination(items) {
    return Math.ceil(items.length / 4);
  }

  static getPaginationWishList(max, reviews) {
    const count = (max * 4) - 1;
    const loopTill = count - 3;
    const finalDocuments = [];
    for (let i = count; i >= loopTill; i--) {
      if (reviews[i]) { finalDocuments.push(reviews[i]); }
    }
    return finalDocuments.reverse();
  }
}

module.exports = WishlistService;
