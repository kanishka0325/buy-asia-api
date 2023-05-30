const mongoose = require('mongoose');
const { STATUS_PENDING_APR, STATUS_APPROVED, STATUS_REJECTED } = require('../constants/status');
const TempBrandModel = require('../models/temp_prod_brand_model');
const BrandModel = require('../models/prod_brand_model');
const { logger } = require('../utils/logger');
const { TMPLT_BRAND_APPROVAL, TMPLT_BRAND_REJECTION } = require('../constants/templates');
const { SUBJECT_BRAND_APPROVAL, SUBJECT_REJECTED } = require('../constants/subjects');
const { SENDER_BUYASIA } = require('../constants/senders');
const { send } = require('./mail_service');

class TempBrandService {
  static async add(body) {
    let brand = TempBrandModel(body);
    brand = await brand.save();
    return brand;
  }

  static async getWpgn(skip, limit, search = '') {
    const filter = { status: STATUS_PENDING_APR };

    if (search) {
      const re = new RegExp(search, 'i');
      filter.name = { $regex: re };
    }

    const numOfDocs = await TempBrandModel.countDocuments(filter);

    const data = await TempBrandModel.find(filter).skip(skip).limit(limit).populate('prodCategory', 'name');
    logger.info(`Retrieved ${numOfDocs} document from temp_prod_brands`);

    return { data, numOfDocs };
  }

  static async findOne(filter, populateCategory = false) {
    const brand = populateCategory ? await TempBrandModel.findOne(filter).populate('prodCategory')
      : await TempBrandModel.findOne(filter);

    return brand;
  }

  static async modify(id, upBody) {
    const upBrand = await TempBrandModel.findByIdAndUpdate(id, upBody, { new: true });
    return upBrand;
  }

  static async proceed(upBody, tBrand) {
    const tempBrand = tBrand;
    let session;
    try {
      session = await mongoose.startSession();
      session.startTransaction();

      tempBrand.status = upBody.status;

      let template;
      const context = {
        sender: SENDER_BUYASIA,
      };

      if (upBody.status === STATUS_REJECTED) {
        tempBrand.rejectReason = upBody.rejectReason;
        template = TMPLT_BRAND_REJECTION;
        context.title = SUBJECT_REJECTED;
        context.rejectReason = upBody.rejectReason;
      }

      const upTempBrand = await tempBrand.save({ session });

      let result = upTempBrand;

      if (upBody.status === STATUS_APPROVED) {
        let brand = BrandModel({
          categories: [upTempBrand.prodCategory],
          name: upTempBrand.name,
          imageUrl: upTempBrand.imageUrl,
        });

        brand = await brand.save({ session });

        result = { upTempBrand, brand };
        template = TMPLT_BRAND_APPROVAL;
        context.title = SUBJECT_BRAND_APPROVAL;
        context.brand = upTempBrand.name;
        context.category = upTempBrand.prodCategory.name;
      }

      await send(['w3gtest@gmail.com'], template, context);

      await session.commitTransaction();

      return result;
    } catch (err) {
      await session.abortTransaction();
      throw new Error(err.message);
    } finally {
      session.endSession();
    }
  }
}

module.exports = TempBrandService;
