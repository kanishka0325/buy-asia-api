const VariantModel = require('../models/variant_model');

class VariantService {
  static async get(filter = {}) {
    const variants = await VariantModel.find(filter);
    return variants;
  }
}

module.exports = VariantService;
