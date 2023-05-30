const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const SellerModel = require('../models/seller');
const OtpModel = require('../models/otp');
const {
  STATUS_ACTIVE, STATUS_OTP_VR, STATUS_PENDING_APR, STATUS_PRO_DONE, STATUS_REJECTED,
} = require('../constants/status');
const { SUBJECT_VERIFY } = require('../constants/subjects');
const { SENDER_BUYASIA } = require('../constants/senders');
const { send } = require('./mail_service');
const { TMPLT_SELLER_VERIFY, TMPLT_SELLER_ACTIVE, TMPLT_SELLER_REJECTED } = require('../constants/templates');

class SellerService {
  static async add(body) {
    let seller = SellerModel(body);
    seller = await seller.save();
    // seller = seller.toObject();
    // delete seller.password;
    return seller;
  }

  static async findByMobile(mobile) {
    const seller = await SellerModel.findOne({ mobile });
    return seller;
  }

  static async findByEmail(email) {
    const seller = await SellerModel.findOne({ email });
    return seller;
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

      const upSeller = await SellerModel.findOneAndUpdate(
        { mobile },
        { $set: { status: STATUS_OTP_VR } },
        {
          new: true, session,
        },
      );

      const token = jwt.sign({ id: upSeller._id }, process.env.TOKEN_SECRET);

      console.log(token);

      const context = {
        v_link: `${process.env.DEV_URL}/api/seller/verify-email/${token}`,
        sender: SENDER_BUYASIA,
      };

      await send(['w3gtest@gmail.com'], TMPLT_SELLER_VERIFY, context);

      await session.commitTransaction();

      return { upOtp, upSeller };
    } catch (err) {
      await session.abortTransaction();
      throw new Error(err.message);
    } finally {
      session.endSession();
    }
  }

  static async review(body) {
    let session;
    try {
      session = await mongoose.startSession();
      session.startTransaction();

      const upSeller = await SellerModel.findByIdAndUpdate(
        body.sellerId,
        { $set: body.upSeller },
        {
          fields: { password: 0 },
          new: true,
          session,
        },
      );

      let template = TMPLT_SELLER_ACTIVE;

      const context = {
        name: upSeller.basic.companyName,
        sender: SENDER_BUYASIA,
      };

      if (upSeller.status !== STATUS_ACTIVE) {
        template = TMPLT_SELLER_REJECTED;
        context.v_link = '#'; // add rectify link here
        context.rejReason = upSeller.rejReason;
      }

      await send(['w3gtest@gmail.com'], template, context);

      await session.commitTransaction();

      return upSeller;
    } catch (err) {
      await session.abortTransaction();
      throw new Error(err.message);
    } finally {
      session.endSession();
    }
  }

  static async modify(id, body) {
    const seller = await SellerModel.findByIdAndUpdate(
      id,
      { $set: body },
      {
        fields: { password: 0 },
        new: true,
      },
    );

    return seller;
  }

  static async findByCode(code) {
    const seller = await SellerModel.findOne({ code });
    return seller;
  }

  static async findByBrno(brno) {
    const seller = await SellerModel.findOne({ 'basic.brno': brno });
    return seller;
  }

  static async getWpgn(skip, limit, from, to) {
    const filter = from && to ? {
      status: STATUS_PENDING_APR,
      prStatus: STATUS_PRO_DONE,
      createdAt: { $gte: new Date(from), $lte: new Date(to) },
    }
      : { status: STATUS_PENDING_APR, prStatus: STATUS_PRO_DONE };
    const numOfDocs = await SellerModel.countDocuments(filter);
    const data = await SellerModel.find(filter).select('-password').skip(skip).limit(limit);
    return { data, numOfDocs };
  }

  static async find(id) {
    const seller = await SellerModel.findById(id);
    return seller;
  }

  static async findByIdForBuyer(id) {
    const seller = await SellerModel.findById(id).select('-password -code -status -prStatus -rejReason');
    return seller;
  }

  static async remove(id) {
    const seller = await SellerModel.findByIdAndDelete(id);
    return seller;
  }

  static async modifyByMobile(mobile, body) {
    const user = await SellerModel.findOneAndUpdate(
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

module.exports = SellerService;
