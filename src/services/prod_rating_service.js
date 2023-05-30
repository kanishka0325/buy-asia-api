const mongoose = require('mongoose');
const InvoiceRecordModel = require('../models/invoiceRecords_model');
const ProductModel = require('../models/product_model');
const { logger } = require('../utils/logger');

class ProdRatingService {
  static async add(body) {
    let session;
    try {
      session = await mongoose.startSession();
      session.startTransaction();

      // let rating = RatingModel(body);
      // rating = await rating.save({ session });

      const upInvRec = await InvoiceRecordModel.findByIdAndUpdate(
        body.invoiceRecordId,
        { $set: body },
        {
          new: true,
          session,
        },
      );

      const upProduct = await ProductModel.findById(upInvRec.productId);

      upProduct.totalRating += upInvRec.rating.value;

      upProduct.totalRaters += 1;

      const avgRating = upProduct.totalRating / upProduct.totalRaters;

      upProduct.avgRating = avgRating.toFixed(1);

      await upProduct.save({ session });

      await session.commitTransaction();

      logger.info(`Updated existing invoicerecord doucment (${upInvRec._id}) and Updated existing product (${upProduct._id})`);

      return { upInvRec, upProduct };
    } catch (err) {
      await session.abortTransaction();
      throw new Error(err.message);
    } finally {
      session.endSession();
    }
  }

  static async findRatingsForProducts(id) {
    // eslint-disable-next-line max-len
    const invoiceRecords = await InvoiceRecordModel.find({ productId: id, 'rating.status': true }).select('rating').populate({ path: 'invoiceId', select: 'name' }).sort({ updatedAt: -1 })
      .exec();
    return invoiceRecords;
  }

  static async calculateRatingwithUsers(id) {
    // eslint-disable-next-line max-len
    const invoiceRecords = await InvoiceRecordModel.find({ productId: id, 'rating.status': true }).select('rating')
      .exec();

    const ratings = [5, 4, 3, 2, 1];

    const result = [];

    ratings.forEach((item) => {
      const ratingType = {
        type: `${item} Stars`,
        rating: '',
        count: 0,
      };
      invoiceRecords.forEach((itemTwo) => {
        if (item === itemTwo.rating.value) {
          ratingType.count += 1;
        }
      });

      result.push(ratingType);
    });

    result.forEach((item) => {
      if (item.count > 0 && invoiceRecords.length > 0) {
        const percentage = (item.count / invoiceRecords.length) * 100;
        // eslint-disable-next-line no-param-reassign
        item.rating = `${Math.trunc(percentage)}%`;
      } else {
        // eslint-disable-next-line no-param-reassign
        item.rating = '0%';
      }
    });

    return result;
  }
}

module.exports = ProdRatingService;
