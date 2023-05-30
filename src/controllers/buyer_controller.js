const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { toLower, trim } = require('lodash');
const config = require('../config');
const BuyerService = require('../services/BuyerService');
const ErrorService = require('../services/ErrorService');
const OtpService = require('../services/OtpService');
const {
  registrationValidation, personalDetailsValidation, validateAddressDetails, validateLogin,
} = require('../validations/buyer');
const { encrypt, decrypt } = require('../services/CryptoService');
const {
  send,
} = require('../services/mail_service');
const { genrCode } = require('../utils/helper.util');
const { logger } = require('../utils/logger');

const {
  DUP_MOBILE,
  OTP_NF,
  DUP_OTP,
  EXP_OTP,
  INCORRECT_OTP,
  USER_NF,
  INCORRECT_PASS,
  NOT_OTP_VR,
  NOT_PWD,
} = require('../constants/custom_errors');
const {
  verifyOtpValidation, validatePassword, getOtpValidation, validateOtp,
} = require('../validations/public');
const { NF, UNAUTHORIZED } = require('../constants/http_codes');
const { CRYPTO_ERRORS, ERR_TOKEN_EXPIRED, INVALID_TOKEN } = require('../constants/error_codes');
const { STATUS_ACTIVE, STATUS_INITIATED } = require('../constants/status');
const { STATUS_OTP_VR } = require('../constants/status');
const { DUP_EMAIL } = require('../constants/custom_errors');
const { SENDER_BUYASIA } = require('../constants/senders');
const { TMPLT_RECOVERY_CODE } = require('../constants/templates');
const CryptoService = require('../services/CryptoService');

const registration = async (req, res, next) => {
  try {
    const { error } = registrationValidation(req.body);

    if (error) {
      next(ErrorService.badRequest(error.details[0].message));
      return;
    }

    const mobileExists = await BuyerService.findByMobile(req.body.mobile);

    if (mobileExists?.status === STATUS_INITIATED) {
      next(new ErrorService(404, 'Your contact number is given you should Verify your OTP and Activate your account', NOT_OTP_VR));
      return;
    }

    if (mobileExists?.status === STATUS_OTP_VR && !mobileExists.password) {
      next(new ErrorService(404, 'Verify your OTP again and provide password and Activate your account', NOT_PWD));
      return;
    }

    if (mobileExists?.status === STATUS_ACTIVE) {
      next(new ErrorService(409, 'Mobile already exists', DUP_MOBILE));
      return;
    }

    const otpAdded = await OtpService.add(10);

    // const smsService = new SmsService(req.body.mobile, `Your otp is ${otpAdded.otp}`);

    // await smsService.send();

    const details = {
      mobile: req.body.mobile,
      otpId: otpAdded._id,
    };

    const verifyKey = encrypt(JSON.stringify(details));

    let code;

    do {
      const c = genrCode(6);
      const codeExists = await BuyerService.findByCode(c);
      if (!codeExists) {
        code = c;
      }
    } while (!code);

    const body = {
      ...req.body,
      code,
    };

    const buyerAdded = await BuyerService.add(body);

    logger.info(`Created a new buyer document in MongoDB (${buyerAdded._id})`);

    res.status(200).send({ buyerAdded, verifyKey });
  } catch (err) {
    next(ErrorService.internal(err.message));
  }
};

const createOTP = async (req, res, next) => {
  try {
    const { error } = registrationValidation(req.body);

    if (error) {
      next(ErrorService.badRequest(error.details[0].message));
      return;
    }

    // const emailExists = await SellerService.findByEmail(toLower(req.body.email));

    // if (emailExists) {
    //   next(new ErrorService(409, 'Email already exists', DUP_EMAIL));
    //   return;
    // }

    const otpAdded = await OtpService.add(10);

    // const smsService = new SmsService(req.body.mobile, `Your otp is ${otpAdded.otp}`);

    // await smsService.send();

    const details = {
      mobile: req.body.mobile,
      otpId: otpAdded._id,
    };

    const verifyKey = encrypt(JSON.stringify(details));

    const mobile = await BuyerService.findByMobile(req.body.mobile);

    logger.info(`(${mobile._id}) requesting otp again`);

    res.status(200).send({ mobile, verifyKey });
  } catch (err) {
    next(ErrorService.internal(err.message));
  }
};

const verifyOtp = async (req, res, next) => {
  try {
    const { error } = verifyOtpValidation(req.body);

    if (error) {
      next(ErrorService.badRequest(error.details[0].message));
      return;
    }

    const decoded = decrypt(req.body.verifyKey);

    const verified = JSON.parse(decoded);

    const buyer = await BuyerService.findByMobile(verified.mobile);

    if (!buyer) {
      next(new ErrorService(404, 'Buyer not found', NF));
      return;
    }

    const otp = await OtpService.find(verified.otpId);

    if (!otp) {
      next(new ErrorService(404, 'OTP not found', OTP_NF));
      return;
    }

    if (otp.verified) {
      next(new ErrorService(400, 'OTP already verified', DUP_OTP));
      return;
    }

    if (otp.expTime.getTime() < new Date().getTime()) {
      next(new ErrorService(400, 'OTP Expired', EXP_OTP));
      return;
    }

    if (otp.otp !== req.body.otp) {
      next(new ErrorService(400, 'Incorrect OTP', INCORRECT_OTP));
      return;
    }

    const token = jwt.sign({ id: buyer._id }, process.env.TOKEN_SECRET);

    const { upBuyer, upOtp } = await BuyerService.verifyOtp(otp._id, buyer.mobile);

    // console.log(upOtp);

    logger.info(`Change the status of buyer document (${upBuyer._id}) to ${upBuyer.status}`);

    res.status(200).send({ upBuyer, token });
  } catch (err) {
    if (CRYPTO_ERRORS.includes(err.code)) {
      next(ErrorService.badRequest('Invalid verifyKey'));
      return;
    }
    next(ErrorService.internal(err.message));
  }
};

const confirmPassword = async (req, res, next) => {
  try {
    const token = req.header('x-authToken');

    if (!token) {
      next(new ErrorService(401, 'Unauthorized access', UNAUTHORIZED));
      return;
    }

    const verified = jwt.verify(token, process.env.TOKEN_SECRET);

    if (!verified.id) {
      next(new ErrorService(401, 'Invalid token', UNAUTHORIZED));
      return;
    }

    const { error } = validatePassword(req.body);

    if (error) {
      next(ErrorService.badRequest(error.details[0].message));
      return;
    }

    const buyer = await BuyerService.find(verified.id);

    if (!buyer) {
      next(new ErrorService(404, 'Buyer not found', NF));
      return;
    }

    // if (seller.status === STATUS_INITIATED) {
    //   next(new ErrorService(405, 'Verify your mobile number first', NA));
    //   return;
    // }

    const password = bcrypt.hashSync(req.body.password, config.saltRounds);

    const upBuyer = await BuyerService.modify(
      buyer._id,
      {
        status: STATUS_ACTIVE,
        password,
      },
    );

    logger.info(`Change the password of buyer document (${buyer._id})`);

    res.status(200).send(upBuyer);
  } catch (err) {
    if (err.name === ERR_TOKEN_EXPIRED) {
      next(new ErrorService(401, 'Token expired', UNAUTHORIZED));
      return;
    } if (err.name === INVALID_TOKEN) {
      next(new ErrorService(401, 'Invalid token', UNAUTHORIZED));
      return;
    }
    next(ErrorService.internal(err.message));
  }
};

const addPersonalDetails = async (req, res, next) => {
  try {
    if (!req.buyer) {
      throw new Error('Missing auth middleware call before controller function');
    }

    const { error } = personalDetailsValidation(req.body);

    if (error) {
      next(new ErrorService(400, error.details[0].message, error.details[0].context.key));
      return;
    }

    const exist = await BuyerService.findByEmail(
      req.body.email,
    );

    if (exist) {
      if (exist._id.toString() !== req.buyer._id.toString()) {
        next(new ErrorService(406, 'Email already been used', DUP_EMAIL));
        return;
      }
    }

    const body = {
      ...req.body,
    };

    const upBuyer = await BuyerService.modify(
      req.buyer._id,
      body,
    );

    logger.info(`Modified buyer document: ${req.sellerId}`);

    res.status(200).send(upBuyer);
  } catch (err) {
    if (err.name === ERR_TOKEN_EXPIRED) {
      next(new ErrorService(401, 'Token expired', UNAUTHORIZED));
      return;
    } if (err.name === INVALID_TOKEN) {
      next(new ErrorService(401, 'Invalid token', UNAUTHORIZED));
      return;
    }
    next(ErrorService.internal(err.message));
  }
};

const addAddressDetails = async (req, res, next) => {
  try {
    if (!req.buyer) {
      throw new Error('Missing auth middleware call before controller function');
    }

    const { error } = validateAddressDetails(req.body);

    if (error) {
      next(ErrorService.badRequest(error.details[0].message));
      return;
    }

    const address = {
      ...req.body,
    };

    const upBuyer = await BuyerService.modify(
      req.buyer._id,
      address,
    );

    logger.info(`buyer (${req.buyer._id}) set address details`);

    res.status(200).send(upBuyer);
  } catch (err) {
    next(ErrorService.internal(err.message));
  }
};

const login = async (req, res, next) => {
  try {
    const { error } = validateLogin(req.body);

    if (error) {
      next(ErrorService.badRequest(error.details[0].message));
      return;
    }

    let user = await BuyerService.findByMobile(req.body.mobile);

    if (!user) {
      next(new ErrorService(404, 'The mobile number you entered isn\'t connected to an account.', USER_NF));
      return;
    }

    const passCheck = bcrypt.compareSync(
      req.body.password,
      user.password,
    );

    if (!passCheck) {
      next(new ErrorService(
        401,
        'The password that you\'ve entered is incorrect',
        INCORRECT_PASS,
      ));
      return;
    }

    const token = jwt.sign(
      {
        id: user._id,
      },
      process.env.TOKEN_SECRET,
      { expiresIn: process.env.EXPIRES_IN },
      // { expiresIn: 120 },
    );

    user = user.toObject();
    delete user.password;

    logger.info(`Buyer: ${user.mobile} successFully Logged In`);

    // // Add to Header
    res.header('x-authToken', token);
    res.status(200).send(user);
  } catch (err) {
    next(ErrorService.internal(err.message));
  }
};

const getOtp = async (req, res, next) => {
  try {
    const { error } = getOtpValidation(req.body);
    if (error) {
      next(ErrorService.badRequest(error.details[0].message));
      return;
    }

    const user = await BuyerService.findByMobile(trim(req.body.mobile));

    if (!user) {
      next(new ErrorService(404, 'User not exist', NF));
      return;
    }

    if (![STATUS_OTP_VR, STATUS_ACTIVE].includes(user.status)) {
      next(new ErrorService(404, 'Account is inactive or not activated yet', UNAUTHORIZED));
      return;
    }

    const otpAdded = await OtpService.add(10);
    logger.info(`Created a new otp document in MongoDB (${otpAdded._id})`);

    const details = {
      mobile: user.mobile,
      otpId: otpAdded._id,
    };

    const verifyKey = CryptoService.encrypt(JSON.stringify(details));

    // const token = jwt.sign(
    //   { email: user.email },
    //   process.env.TOKEN_SECRET,
    //   { expiresIn: '1h' },
    // );

    // const context = {
    //   firstName: user.first_name,
    //   otp: otpAdded.otp,
    //   hRef: `${process.env.CLIENT_BASE_URL}/reset/${token}`,
    //   sender: SENDER_BUYASIA,
    // };

    // await send(['w3gtest@gmail.com'], TMPLT_RECOVERY_CODE, context);

    // const smsService = new SmsService(user.mobile, `Your otp is ${otpAdded.otp}`);

    // await smsService.send();

    res.status(200).send({ verifyKey });

    logger.info(`Attempt on ${req.method} ${req.originalUrl} is successfull`);
  } catch (err) {
    next(ErrorService.internal(err.message));
  }
};

const compareOtp = async (req, res, next) => {
  try {
    const { error } = validateOtp(req.body);
    if (error) {
      next(ErrorService.badRequest(error.details[0].message));
      return;
    }

    const decoded = CryptoService.decrypt(req.body.verifyKey);

    const verified = JSON.parse(decoded);

    const user = await BuyerService.findByMobile(verified.mobile);

    if (!user) {
      next(new ErrorService(404, 'User not exist', NF));
      return;
    }

    const otp = await OtpService.find(verified.otpId);

    if (!otp) {
      next(new ErrorService(404, 'OTP not found', OTP_NF));
      return;
    }

    if (otp.verified) {
      next(new ErrorService(409, 'OTP already verified', DUP_OTP));
      return;
    }

    if (otp.expTime.getTime() < new Date().getTime()) {
      next(new ErrorService(401, 'OTP Expired', EXP_OTP));
      return;
    }

    if (otp.otp !== req.body.otp) {
      next(new ErrorService(401, 'Incorrect OTP', INCORRECT_OTP));
      return;
    }

    await OtpService.modifyOtp(otp._id);

    // if (user.otp !== req.body.otp) {
    //   next(new ErrorService(401, 'Invalid otp', UNAUTHORIZED));
    //   return;
    // }

    const token = jwt.sign(
      { mobile: user.mobile },
      process.env.TOKEN_SECRET,
      { expiresIn: '1h' },
    );

    res.header('x-authToken', token);
    res.status(200).send({ mobile: user.mobile });

    logger.info(`Attempt on ${req.method} ${req.originalUrl} is successfull`);
  } catch (err) {
    next(ErrorService.internal(err.message));
  }
};

const resetPass = async (req, res, next) => {
  try {
    if (!req.mobile) {
      throw new Error('Missing auth middleware call before controller function');
    }

    const { error } = validatePassword(req.body);
    if (error) {
      next(ErrorService.badRequest(error.details[0].message));
      return;
    }

    const user = await BuyerService.findByMobile(req.mobile);

    if (!user) {
      next(new ErrorService(404, 'User not exist', NF));
      return;
    }

    const password = bcrypt.hashSync(req.body.password, config.saltRounds);

    await BuyerService.modifyByMobile(
      user.mobile,
      { password },
    );

    res.status(204).send();
    logger.info(`Attempt on ${req.method} ${req.originalUrl} is successfull`);
  } catch (err) {
    next(ErrorService.internal(err.message));
  }
};

module.exports = {
  registration,
  verifyOtp,
  confirmPassword,
  addPersonalDetails,
  addAddressDetails,
  login,
  createOTP,
  getOtp,
  compareOtp,
  resetPass,
};
