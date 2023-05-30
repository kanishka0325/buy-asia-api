const mongoose = require('mongoose');
const { STATUS_OTP_VR } = require('../constants/status');
const BuyerModel = require('../models/buyer_model');
const OtpModel = require('../models/otp');

class BuyerService {
  static async add(body) {
    let buyer = BuyerModel(body);
    buyer = await buyer.save();
    return buyer;
  }

  static async findByMobile(mobile) {
    const buyer = await BuyerModel.findOne({ mobile });
    return buyer;
  }

  static async findByEmail(email) {
    const buyer = await BuyerModel.findOne({ email });
    return buyer;
  }

  static async findByCode(code) {
    const buyer = await BuyerModel.findOne({ code });
    return buyer;
  }

  static async verifyOtp(otpId, mobile) {
    let session;
    try {
      session = await mongoose.startSession();
      session.startTransaction();

      const upOtp = await OtpModel.findByIdAndUpdate(
        otpId,
        { $set: { verified: true } },
        {
          new: true, session,
        },
      );

      const upBuyer = await BuyerModel.findOneAndUpdate(
        { mobile },
        { $set: { status: STATUS_OTP_VR } },
        {
          new: true, session,
        },
      );

      await session.commitTransaction();

      return { upOtp, upBuyer };
    } catch (err) {
      await session.abortTransaction();
      throw new Error(err.message);
    } finally {
      session.endSession();
    }
  }

  static async modify(id, body) {
    const buyer = await BuyerModel.findByIdAndUpdate(
      id,
      { $set: body },
      {
        fields: { password: 0 },
        new: true,
      },
    );

    return buyer;
  }

  static async find(id) {
    const buyer = await BuyerModel.findById(id);
    return buyer;
  }

  static async modifyByMobile(mobile, body) {
    const user = await BuyerModel.findOneAndUpdate(
      { mobile },
      body,
      {
        fields: { password: 0 },
        new: true,
      },
    );

    return user;
  }
}

module.exports = BuyerService;
