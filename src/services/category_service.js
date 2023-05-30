const mongoose = require('mongoose');
const CategoryModel = require('../models/prod_category');
const SubCategoryModel = require('../models/prod_sub_category');
const SellerProdCategory = require('../models/seller_prod_category_model');
const SellerProdSubCategory = require('../models/seller_prod_sub_category_model');
const SellerProdGroupCategory = require('../models/seller_prod_group_model');
const GroupModel = require('../models/prod_group');
const { STATUS_INACTIVE, STATUS_ACTIVE } = require('../constants/status');

class CategoryService {
  static async addCategory(body) {
    let prodCat = CategoryModel(body);
    prodCat = await prodCat.save();
    return prodCat;
  }

  static async findCategory(filter) {
    const prodCat = await CategoryModel.findOne(filter);
    return prodCat;
  }

  static async addSubCategory(body) {
    let prodSubCat = SubCategoryModel(body);
    prodSubCat = await prodSubCat.save();
    return prodSubCat;
  }

  static async findSubCategory(filter, populateCat) {
    const prodSubCat = populateCat ? await SubCategoryModel.findOne(filter).populate('prodCategory') : await SubCategoryModel.findOne(filter);
    return prodSubCat;
  }

  static async addGroup(body) {
    let prodGroup = GroupModel(body);
    prodGroup = await prodGroup.save();
    return prodGroup;
  }

  static async findGroup(filter, populateSubCat) {
    const prodGroup = populateSubCat ? await GroupModel.findOne(filter).populate('prodSubCategory') : await GroupModel.findOne(filter);
    return prodGroup;
  }

  static async getCategories() {
    const prodCats = await CategoryModel.find({ status: STATUS_ACTIVE });

    const prodSubCats = prodCats.length
      ? await SubCategoryModel.find({ prodCategory: prodCats[0]._id, status: STATUS_ACTIVE }) : [];

    const prodGroups = prodSubCats.length
      ? await GroupModel.find({ prodSubCategory: prodSubCats[0]._id, status: STATUS_ACTIVE }) : [];

    return { prodCats, prodSubCats, prodGroups };
  }

  static async getSubCategories(prodCategory) {
    const prodSubCats = await SubCategoryModel.find({ prodCategory, status: STATUS_ACTIVE });

    const prodGroups = prodSubCats.length
      ? await GroupModel.find({ prodSubCategory: prodSubCats[0]._id, status: STATUS_ACTIVE }) : [];

    return { prodSubCats, prodGroups };
  }

  static async getGroups(prodSubCategory) {
    const prodGroups = await GroupModel.find({ prodSubCategory, status: STATUS_ACTIVE });
    return prodGroups;
  }

  static async modifyCategory(id, upBody) {
    const prodCat = await CategoryModel.findByIdAndUpdate(id, upBody, { new: true });
    return prodCat;
  }

  static async modifySubCategory(id, upBody) {
    const prodSubCat = await SubCategoryModel.findByIdAndUpdate(id, upBody, { new: true });
    return prodSubCat;
  }

  static async modifyGroup(id, upBody) {
    const prodGroup = await GroupModel.findByIdAndUpdate(id, upBody, { new: true });
    return prodGroup;
  }

  static async retrieveAll() {
    const prodCats = await CategoryModel.find({ status: STATUS_ACTIVE });

    const prodSubCats = await SubCategoryModel.find({ status: STATUS_ACTIVE });

    const prodGroups = await GroupModel.find({ status: STATUS_ACTIVE });

    let subCategories = prodSubCats.map((sc) => ({
      _id: sc._id,
      prodCategory: sc.prodCategory,
      name: sc.name,
      imageUrl: sc.imageUrl,
      aot: sc.aot,
      groups: prodGroups.filter((g) => g.prodSubCategory.equals(sc._id)).map((fg) => ({
        _id: fg._id,
        prodSubCategory: fg.prodSubCategory,
        name: fg.name,
        imageUrl: fg.imageUrl,
        aot: fg.aot,
      })),
    }));

    subCategories = subCategories.filter((sc) => sc.groups.length);

    const categories = prodCats.map((c) => ({
      _id: c._id,
      name: c.name,
      imageUrl: c.imageUrl,
      subCategories: subCategories.filter((sc) => sc.prodCategory.equals(c._id)),
    }));

    const result = categories.filter((c) => c.subCategories.length);

    return result;
  }

  static async findCategories(filter) {
    const prodCats = await CategoryModel.find(filter);
    return prodCats;
  }

  static async findCategoriesForPublic(sellerId) {
    let sellerProdCats = await SellerProdCategory.find({ sellerId }).populate('prodCategory');
    sellerProdCats = sellerProdCats.map((cat) => ({
      id: cat.prodCategory._id, name: cat.prodCategory.name,
    }));
    let sellerProdSubCats = await SellerProdSubCategory.find({ sellerId }).populate('prodSubCategory');
    sellerProdSubCats = sellerProdSubCats.map((cat) => ({
      sellerProdCats: cat.prodCategory,
      id: cat.prodSubCategory._id,
      name: cat.prodSubCategory.name,
    }));
    let sellerProdGroupCats = await SellerProdGroupCategory.find({ sellerId }).populate('prodGroup');
    sellerProdGroupCats = sellerProdGroupCats.map((cat) => ({
      sellerProdSubCats: cat.prodSubCategory, id: cat.prodGroup._id, name: cat.prodGroup.name,
    }));
    return { sellerProdCats, sellerProdSubCats, sellerProdGroupCats };
  }
}

module.exports = CategoryService;
