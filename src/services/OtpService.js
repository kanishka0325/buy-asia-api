const bcrypt = require('bcryptjs');
const OtpModel = require('../models/otp');
const { AddMinutesToDate, genrOtp } = require('../utils/helper.util');

class OtpService {
  static async add(expiresIn) {
    // let otp = genrOtp();
    let otp = 123456;
    const now = new Date();
    const expTime = AddMinutesToDate(now, expiresIn);
    otp = new OtpModel({ otp, expTime });
    otp = await otp.save();
    return otp;
  }

  static async find(id) {
    const otp = await OtpModel.findById(id);
    return otp;
  }

  static async modifyOtp(otpId) {
    const upOtp = await OtpModel.findByIdAndUpdate(
      otpId,
      { $set: { verified: true } },
      {
        new: true,
      },
    );
    return upOtp;
  }
}

module.exports = OtpService;
