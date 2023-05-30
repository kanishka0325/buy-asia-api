const BrandModel = require('../models/prod_brand_model');

class BrandService {
  static async add(body) {
    let brand = BrandModel(body);
    brand = await brand.save();
    return brand;
  }

  static async find(id) {
    const brand = await BrandModel.findById(id);
    return brand;
  }

  static async findByName(name) {
    const brand = await BrandModel.findOne({ name });
    return brand;
  }

  static async getWpgn(skip, limit, search = '') {
    const filter = { };

    if (search) {
      const re = new RegExp(search, 'i');
      filter.name = { $regex: re };
    }

    const numOfDocs = await BrandModel.countDocuments(filter);

    // const sort = {};

    const data = await BrandModel.find(filter).skip(skip).limit(limit);

    return { data, numOfDocs };
  }

  static async findOne(filter) {
    const brand = await BrandModel.findOne(filter);
    return brand;
  }

  static async modify(id, upBody) {
    const upBrand = await BrandModel.findByIdAndUpdate(id, upBody, { new: true });
    return upBrand;
  }

  static async getMultiple(filter = {}) {
    const brands = await BrandModel.find(filter);
    return brands;
  }
}

module.exports = BrandService;
