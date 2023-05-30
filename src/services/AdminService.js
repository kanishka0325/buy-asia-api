const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const { toLower } = require('lodash');
const { SENDER_BUYASIA } = require('../constants/senders');
const { STATUS_ACTIVE } = require('../constants/status');
const { TMPLT_ADMIN_VERIFY } = require('../constants/templates');
const { TYPE_ADMIN } = require('../constants/user_types');
const AdminModel = require('../models/admin');
const { send } = require('./mail_service');
const { SUBJECT_VERIFY } = require('../constants/subjects');

class AdminService {
  static async findByEmail(email) {
    const admin = await AdminModel.findOne({ email: toLower(email) });
    return admin;
  }

  static async findByMobile(mobile) {
    const admin = await AdminModel.findOne({ mobile });
    return admin;
  }

  static async add(body) {
    let session;
    try {
      session = await mongoose.startSession();
      session.startTransaction();

      let newAdmin = new AdminModel(body);
      newAdmin = await newAdmin.save({ session });

      const token = jwt.sign({ id: newAdmin._id }, process.env.TOKEN_SECRET);

      const context = {
        title: SUBJECT_VERIFY,
        firstName: newAdmin.firstName,
        v_link: `${process.env.DEV_URL}/api/admin/verify-email/${token}`,
        sender: SENDER_BUYASIA,
      };

      await send(['w3gtest@gmail.com'], TMPLT_ADMIN_VERIFY, context);

      await session.commitTransaction();

      return newAdmin;
    } catch (err) {
      await session.abortTransaction();
      throw new Error(err.message);
    } finally {
      session.endSession();
    }
  }

  // static async add(body) {
  //   let newAdmin = new AdminModel(body);
  //   newAdmin = await newAdmin.save();
  //   return newAdmin;
  // }

  static async modify(id, body) {
    const upAdmin = await AdminModel.findByIdAndUpdate(
      id,
      { $set: body },
      {
        fields: { password: 0 },
        new: true,
      },
    );

    return upAdmin;
  }

  static async getWpgn(skip, limit, search) {
    const re = new RegExp(search, 'i');
    const filter = {
      $and: [
        {
          // status: STATUS_ACTIVE,
          type: TYPE_ADMIN,
        },
        {
          $or: [{ firstName: { $regex: re } },
            { lastName: { $regex: re } },
            { email: { $regex: re } }],
        },
      ],
    };

    const numOfDocs = await AdminModel.countDocuments(filter);
    const data = await AdminModel.find(filter).select('-password').skip(skip).limit(limit);
    return { data, numOfDocs };
  }

  static async find(id) {
    const admin = await AdminModel.findById(id);
    return admin;
  }
}

module.exports = AdminService;
