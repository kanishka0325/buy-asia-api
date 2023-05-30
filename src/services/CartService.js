const CartModel = require('../models/cart_model');

class CartService {
  static async add(body) {
    let cartItem = CartModel(body);
    cartItem = await cartItem.save();
    return cartItem;
  }

  static async findById(productId, buyerId) {
    const cartItem = await CartModel.findOne({ product: productId, buyer: buyerId });
    if (cartItem === null) {
      return false;
    }
    return true;
  }

  static async findByIdAndUpdate(data) {
    const cartItem = await CartModel.findOne({ _id: data.id });
    if (data.option === 'plus') {
      let qty = cartItem.quantity;
      qty += 1;
      cartItem.quantity = qty;
    } else {
      let qty = cartItem.quantity;
      qty -= 1;
      cartItem.quantity = qty;
    }

    const result = await cartItem.save();
    return result;
  }

  static async find(id) {
    const cartItems = await CartModel.find({ buyer: id }).populate('product').exec();
    return cartItems;
  }

  static async findAndCount(id) {
    const cartItems = await CartModel.find({ buyer: id }).exec();
    return cartItems.length;
  }

  static async delete(id) {
    const cartItem = await CartModel.deleteOne({ _id: id }).exec();
    return cartItem;
  }

  static async deleteMany(id) {
    const cartItem = await CartModel.deleteMany({ buyer: id }).exec();
    return cartItem;
  }
}

module.exports = CartService;
