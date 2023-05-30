const { startSession } = require('mongoose');
const ProductModel = require('../models/product_model');
const SellerProductCategoryModel = require('../models/seller_prod_category_model');
const SellerProductSubCategoryModel = require('../models/seller_prod_sub_category_model');
const SellerProductGroupModel = require('../models/seller_prod_group_model');
const { logger } = require('../utils/logger');

class ProductService {
  static async add(body) {
    let session;
    try {
      session = await startSession();
      session.startTransaction();

      let product = new ProductModel(body);
      product = await product.save({ session });

      logger.info(`New document inserted into the product collection under ${product._id}`);

      const sellerProdCategory = await SellerProductCategoryModel.findOne({
        sellerId: product.seller,
        prodCategory: product.prodCategory,
      });

      if (sellerProdCategory) {
        const sellerProdSubCategory = await SellerProductSubCategoryModel.findOne({
          sellerId: product.seller,
          prodSubCategory: product.prodSubCategory,
        });

        if (sellerProdSubCategory) {
          const sellerProdGroup = await SellerProductGroupModel.findOne({
            sellerId: product.seller,
            prodGroup: product.prodGroup,
          });

          if (!sellerProdGroup) {
            const newSellerProdGroup = await new SellerProductGroupModel({
              sellerId: product.seller,
              prodSubCategory: product.prodSubCategory,
              prodGroup: product.prodGroup,
            }).save({ session });
            logger.info(`New document inserted into the seller_prod_group collection under ${newSellerProdGroup._id}`);
          }
        } else {
          const newSellerProdSubCategory = await new SellerProductSubCategoryModel({
            sellerId: product.seller,
            prodCategory: product.prodCategory,
            prodSubCategory: product.prodSubCategory,
          }).save({ session });
          logger.info(`New document inserted into the seller_prod_sub_category collection under ${newSellerProdSubCategory._id}`);

          const newSellerProdGroup = await new SellerProductGroupModel({
            sellerId: product.seller,
            prodSubCategory: product.prodSubCategory,
            prodGroup: product.prodGroup,
          }).save({ session });
          logger.info(`New document inserted into the seller_prod_group collection under ${newSellerProdGroup._id}`);
        }
      } else {
        const newSellerProdCategory = await new SellerProductCategoryModel({
          sellerId: product.seller,
          prodCategory: product.prodCategory,
        }).save({ session });
        logger.info(`New document inserted into the seller_prod_category collection under ${newSellerProdCategory._id}`);

        const newSellerProdSubCategory = await new SellerProductSubCategoryModel({
          sellerId: product.seller,
          prodCategory: product.prodCategory,
          prodSubCategory: product.prodSubCategory,
        }).save({ session });
        logger.info(`New document inserted into the seller_prod_sub_category collection under ${newSellerProdSubCategory._id}`);

        const newSellerProdGroup = await new SellerProductGroupModel({
          sellerId: product.seller,
          prodSubCategory: product.prodSubCategory,
          prodGroup: product.prodGroup,
        }).save({ session });
        logger.info(`New document inserted into the seller_prod_group collection under ${newSellerProdGroup._id}`);
      }

      await session.commitTransaction();

      return product;
    } catch (err) {
      await session.abortTransaction();
      throw new Error(err.message);
    } finally {
      session.endSession();
    }
  }

  static async findOne(id) {
    const product = await ProductModel.findById(id).exec();
    return product;
  }

  static async find(filter) {
    const product = await ProductModel.findOne(filter).populate('seller').exec();
    return product;
  }

  static async findProductsForReviewsFilter(sellerId) {
    const products = await ProductModel.find({ seller: sellerId }).select('_id title').exec();
    return products;
  }

  static async findRelatedProducts(filter) {
    const products = await ProductModel.find({ prodGroup: filter }).limit(10).exec();
    return products.sort(() => Math.random() - 0.5);
  }

  static async findRelatedProductsFromArray(prodGroup) {
    let limit = 10;
    const result = [];

    if (prodGroup.length === 2) {
      limit = 5;
    } else if (prodGroup.length === 3) {
      limit = 3;
    } else if (prodGroup.length > 3 && prodGroup.length <= 7) {
      limit = 2;
    } else if (prodGroup.length > 7) {
      limit = 1;
    }

    const promise = prodGroup.map(async (group) => {
      const products = await ProductModel.find({ prodGroup: group }).limit(limit).exec();
      products.forEach((prod) => {
        result.push(prod);
      });

      return result.sort(() => Math.random() - 0.5);
    });

    await Promise.all(promise);

    return result;
  }

  static async findRecentlyViewedProducts(prodIds) {
    const result = [];

    const promise = prodIds.map(async (id) => {
      const product = await ProductModel.findOne({ _id: id }).exec();
      result.push(product);
    });

    await Promise.all(promise);

    return result;
  }

  static async getWpgnForSeller(skip, limit, seller, search = '', prodCategory = null, prodSubCategory = null, prodGroup = null, prodBrand = null, title = '', createdAt = '') {
    const re = new RegExp(search, 'i');
    const filter = {
      $and: [
        {
          seller,
        },
        {
          $or: [
            { code: { $regex: re } },
            { title: { $regex: re } },
          ],
        },
      ],
    };

    if (prodCategory) {
      filter.$and.push({ prodCategory });
    }

    if (prodSubCategory) {
      filter.$and.push({ prodSubCategory });
    }

    if (prodGroup) {
      filter.$and.push({ prodGroup });
    }

    if (prodBrand) {
      filter.$and.push({ prodBrand });
    }

    const numOfDocs = await ProductModel.countDocuments(filter);

    const sort = {};

    if (title.trim().length) {
      sort.title = title.trim();
    } else if (createdAt.trim().length) {
      sort.createdAt = createdAt.trim();
    }

    const data = await ProductModel.find(filter).skip(skip).limit(limit).sort(sort);
    return { data, numOfDocs };
  }

  static async modify(id, upBody) {
    const upProduct = await ProductModel.findByIdAndUpdate(id, upBody, { new: true });
    return upProduct;
  }

  static async getWpgn(skip, limit, search = '', sortRating = null, min = null, max = null, avgRating = null, prodCategory = null, prodSubCategory = null, prodGroup = null, prodBrand = null) {
    const re = new RegExp(search, 'i');
    const filter = {
      $and: [
        {
          $or: [
            { code: { $regex: re } },
            { title: { $regex: re } },
          ],
        },
      ],
    };

    if (prodCategory) {
      filter.$and.push({ prodCategory });
    }

    if (prodSubCategory) {
      filter.$and.push({ prodSubCategory });
    }

    if (prodGroup) {
      filter.$and.push({ prodGroup });
    }

    if (prodBrand) {
      filter.$and.push({ prodBrand });
    }

    if (min && max) {
      filter.$and.push({ 'variantCombos.0.price': { $gte: min } });
      filter.$and.push({ 'variantCombos.0.price': { $lte: max } });
    }

    if (avgRating && avgRating > 0) {
      filter.$and.push({ avgRating: { $gte: avgRating } });
    }

    const numOfDocs = await ProductModel.countDocuments(filter);

    const sort = {};

    if (sortRating) {
      sort.avgRating = sortRating;
    }

    const data = await ProductModel.find(filter).skip(skip).limit(limit).sort(sort);
    return { data, numOfDocs };
  }

  static async sortVarianCombos({ productId }) {
    const product = await ProductModel.findOne({ _id: productId }).exec();

    // eslint-disable-next-line prefer-const
    let unique = [];
    product.variantCombos.forEach((combo) => {
      unique.push({ variant: combo.variantCombo[0].variant, value: combo.variantCombo[0].value });
    });

    unique = [...new Map(unique.map((item) => [item.value, item])).values()];

    const modifiedArray = [];

    unique.forEach((item) => {
      const newArr = [];
      product.variantCombos.forEach((combo) => {
        if (item.value === combo.variantCombo[0].value) {
          const { length } = combo.variantCombo;
          for (let i = 1; i < length; i++) {
            const newObj = {
              variant: combo.variantCombo[i].variant,
              value: combo.variantCombo[i].value,
              quantity: combo.qty,
              price: combo.price,
            };
            newArr.push(newObj);
          }
        }
      });
      modifiedArray.push({ main: item.variant, value: item.value, variants: newArr });
    });
    return modifiedArray;
  }

  static async findProductsForSellerInSellerPage(body) {
    const filter = {
      $and: [
        {
          seller: body.sellerId,
        },
      ],
    };

    if (body.prodCategory) {
      filter.$and.push({ prodCategory: body.prodCategory });
    }

    if (body.prodSubCategory) {
      filter.$and.push({
        prodSubCategory: body.prodSubCategory,
      });
    }

    if (body.prodGroup) {
      filter.$and.push({ prodGroup: body.prodGroup });
    }

    const products = await ProductModel.find(filter).select('_id title variantCombos imageUrls avgRating')
      .sort({ createdAt: -1 })
      .exec();

    const count = (body.page * 15) - 1;
    const loopTill = count - 14;
    const finalDocuments = [];

    for (let i = count; i >= loopTill; i--) {
      if (products[i]) { finalDocuments.push(products[i]); }
    }

    return { pages: Math.ceil(products.length / 15), products: finalDocuments.reverse() };
  }
}

module.exports = ProductService;
