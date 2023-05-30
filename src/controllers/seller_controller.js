const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { toLower, toUpper, trim } = require('lodash');
const config = require('../config');
const SellerService = require('../services/SellerService');
const MailService = require('../services/MailService');
const ErrorService = require('../services/ErrorService');
const OtpService = require('../services/OtpService');
const SmsService = require('../services/SmsService');
const { encrypt, decrypt } = require('../services/CryptoService');
const { logger } = require('../utils/logger');
const {
  initValidation,
  validateInfo,
  validateLogin,
  validateSellerReview,
  validateGetSellers,
  validateSetTemplate,
  validateTemplateOnly,
} = require('../validations/seller');
const {
  genrCode,
} = require('../utils/helper.util');

const {
  UNAUTHORIZED,
  NF,
  STATUS_INITIATED,
  STATUS_OTP_VR,
  STATUS_EMAIL_VR,
  NA,
  STATUS_PENDING_APR,
  CONFLICT,
  STATUS_ACTIVE,
  STATUS_PRO_DONE,
  STATUS_REJECTED,
  STATUS_TMPLT_SELECTED,
} = require('../constants/status');
const { CRYPTO_ERRORS, ERR_TOKEN_EXPIRED, INVALID_TOKEN } = require('../constants/error_codes');
const { SENDER_BUYASIA } = require('../constants/senders');
const { SUBJECT_VERIFY, SUBJECT_ACTIVE, SUBJECT_REJECTED } = require('../constants/subjects');
const { TMPLT_SELLER_VERIFY, TMPLT_SELLER_ACTIVE, TMPLT_SELLER_REJECTED } = require('../constants/templates');
const {
  validatePassword, verifyOtpValidation, getOtpValidation, validateOtp,
} = require('../validations/public');
const {
  NOT_INIT,
  INCORRECT_OTP,
  INCORRECT_PASS,
  DUP_MOBILE,
  DUP_EMAIL,
  OTP_NF,
  DUP_OTP,
  EXP_OTP,
  USER_NF,
  NOT_OTP_VR,
  DUP_ACTION,
  INVALID_STATUS,
  DUP_BRNO,
  NOT_ACTIVE,
  DUP_MOBILE_OR_EMAIL,
  REJECTED_ACC,
} = require('../constants/custom_errors');
const { mailQueue } = require('../queue');
const { TYPE_SELLER } = require('../constants/user_types');
const { send } = require('../services/mail_service');
const CryptoService = require('../services/CryptoService');

const init = async (req, res, next) => {
  try {
    const { error } = initValidation(req.body);

    if (error) {
      next(ErrorService.badRequest(error.details[0].message));
      return;
    }

    const isMobileExist = await SellerService.findByMobile(req.body.mobile);

    if (isMobileExist && ![STATUS_INITIATED, STATUS_OTP_VR].includes(isMobileExist.status)) {
      next(new ErrorService(409, 'Mobile already exists', DUP_MOBILE));
      return;
    }

    const isEmailExist = await SellerService.findByEmail(toLower(req.body.email));

    if (isEmailExist && ![STATUS_INITIATED, STATUS_OTP_VR].includes(isEmailExist.status)) {
      next(new ErrorService(409, 'Email already exists', DUP_EMAIL));
      return;
    }

    if (isMobileExist && isEmailExist) {
      if (!isMobileExist._id.equals(isEmailExist._id)) {
        next(new ErrorService(409, 'Mobile or email already exists', DUP_MOBILE_OR_EMAIL));
        return;
      }
    }

    const isSellerExist = isMobileExist || isEmailExist;

    const response = {};

    if (isSellerExist) {
      response.sellerAdded = isSellerExist;
      if (isSellerExist.status === STATUS_INITIATED) {
        if (isSellerExist.email !== toLower(req.body.email)) {
          response.sellerAdded = await SellerService.modify(isSellerExist._id, req.body);
          logger.info(`Updated a existing seller document (${response.sellerAdded._id})`);
        }
        const otpAdded = await OtpService.add(10);
        logger.info(`Created a new otp document in MongoDB (${otpAdded._id})`);
        // const smsService = new SmsService(req.body.mobile, `Your otp is ${otpAdded.otp}`);

        // await smsService.send();

        const details = {
          mobile: req.body.mobile,
          otpId: otpAdded._id,
        };

        response.verifyKey = encrypt(JSON.stringify(details));
      } else {
        const token = jwt.sign({ id: isSellerExist._id }, process.env.TOKEN_SECRET);

        const context = {
          v_link: `${process.env.DEV_URL}/api/seller/verify-email/${token}`,
          sender: SENDER_BUYASIA,
        };

        await send(['w3gtest@gmail.com'], TMPLT_SELLER_VERIFY, context);
      }
    } else {
      const otpAdded = await OtpService.add(10);
      logger.info(`Created a new otp document in MongoDB (${otpAdded._id})`);
      // const smsService = new SmsService(req.body.mobile, `Your otp is ${otpAdded.otp}`);

      // await smsService.send();

      const details = {
        mobile: req.body.mobile,
        otpId: otpAdded._id,
      };

      response.verifyKey = encrypt(JSON.stringify(details));

      let code;

      do {
        const c = genrCode(6);
        const codeExists = await SellerService.findByCode(c);
        if (!codeExists) {
          code = c;
        }
      } while (!code);

      const body = {
        ...req.body,
        code,
      };

      response.sellerAdded = await SellerService.add(body);
      logger.info(`Created a new seller document in MongoDB (${response.sellerAdded._id})`);
    }

    console.log(response);

    res.status(200).send(response);
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

    const seller = await SellerService.findByMobile(verified.mobile);

    if (!seller) {
      next(new ErrorService(404, 'Seller not found', NF));
      return;
    }

    if (seller.status !== STATUS_INITIATED) {
      next(new ErrorService(401, `Seller is not in ${STATUS_INITIATED} status`, NOT_INIT));
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

    // const token = jwt.sign({ id: seller._id }, process.env.TOKEN_SECRET);

    // const task = {
    //   to: seller.email,
    //   subject: SUBJECT_VERIFY,
    //   template: TMPLT_SELLER_VERIFY,
    //   context: {
    //     title: SUBJECT_VERIFY,
    //     v_link: `${process.env.DEV_URL}/api/seller/verify-email/${token}`,
    //     sender: SENDER_BUYASIA,
    //   },
    // };

    // mailQueue.push(task);

    const { upSeller, upOtp } = await SellerService.verifyOtp(otp._id, seller.mobile);

    res.status(200).send(upSeller);

    logger.info(`Change the status of seller document (${upSeller._id}) to ${upSeller.status}`);
  } catch (err) {
    if (CRYPTO_ERRORS.includes(err.code)) {
      next(ErrorService.badRequest('Invalid verifyKey'));
      return;
    }
    next(ErrorService.internal(err.message));
  }
};

const verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.params;

    if (!token) {
      next(new ErrorService(401, 'No user token found', UNAUTHORIZED));
      return;
    }

    const verified = jwt.verify(token, process.env.TOKEN_SECRET);

    if (!verified.id) {
      next(new ErrorService(401, 'Invalid token', UNAUTHORIZED));
      return;
    }

    const seller = await SellerService.find(verified.id);

    if (!seller) {
      next(new ErrorService(404, 'Seller not found', USER_NF));
      return;
    }

    // if (seller.status === STATUS_INITIATED) {
    //   next(new ErrorService(405, 'Verify your mobile number first', NOT_OTP_VR));
    //   return;
    // }

    let url = `${process.env.SELLER_BASE_URL}/activate/${token}`;

    if (![STATUS_OTP_VR, STATUS_EMAIL_VR].includes(seller.status)) {
      url = process.env.SELLER_BASE_URL;
    } else if (seller.status === STATUS_OTP_VR) {
      await SellerService.modify(
        seller._id,
        { status: STATUS_EMAIL_VR },
      );
    }

    // if ([STATUS_EMAIL_VR, STATUS_PENDING_APR, STATUS_ACTIVE].includes(seller.status)) {
    //   next(new ErrorService(409, 'Your email is already verified', DUP_ACTION));
    //   return;
    // }

    // if (seller.status !== STATUS_OTP_VR) {
    //   next(new ErrorService(405, `Seller is not in ${STATUS_OTP_VR} status `, INVALID_STATUS));
    //   return;
    // }

    // await SellerService.modify(
    //   seller._id,
    //   { status: STATUS_EMAIL_VR },
    // );

    res.redirect(url);

    logger.info(`Attempt on ${req.method} ${req.originalUrl} is successfull`);
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

const pending = async (req, res, next) => {
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

    const seller = await SellerService.find(verified.id);

    if (!seller) {
      next(new ErrorService(404, 'Seller not found', NF));
      return;
    }

    if (seller.status === STATUS_INITIATED) {
      next(new ErrorService(405, 'Verify your mobile number first', NA));
      return;
    }

    if (seller.status === STATUS_OTP_VR) {
      next(new ErrorService(405, 'Verify your email first', NA));
      return;
    }

    if (seller.status === STATUS_PENDING_APR) {
      next(new ErrorService(409, 'You have already performed this step, wait until the BuyAsia administration review your account and activate', CONFLICT));
      return;
    }

    if (seller.status === STATUS_ACTIVE) {
      next(new ErrorService(405, 'Your account is alreay activated', NA));
      return;
    }

    if (seller.status !== STATUS_EMAIL_VR) {
      next(new ErrorService(405, `Seller is not in ${STATUS_EMAIL_VR} status `, NA));
      return;
    }

    const password = bcrypt.hashSync(req.body.password, config.saltRounds);

    const upSeller = await SellerService.modify(
      seller._id,
      {
        password,
        status: STATUS_PENDING_APR,
      },
    );

    logger.info(`Change the status of seller document (${seller._id}) to ${STATUS_PENDING_APR}`);

    res.status(200).send(upSeller);
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

// Update Seller Profile
const updateSellerInfo = async (req, res, next) => {
  try {
    if (!req.seller) {
      throw new Error('Missing auth middleware call before controller function');
    }
    const basic = {
      ...req.seller.basic,
      ...req.body.basic,
    };

    const cp = {
      ...req.seller.cp,
      ...req.body.cp,
    };

    const contact = {
      ...req.seller.contact,
      ...req.body.contact,
    };

    const body = {
      basic,
      contact,
      cp,
    };
    const upSeller = await SellerService.modify(req.seller._id, body);
    logger.info(`Seller (${req.seller._id}) Updated`);
    res.status(200).send(upSeller);
  } catch (err) {
    next(ErrorService.internal(err.message));
  }
};

const updateTemplate = async (req, res, next) => {
  try {
    if (!req.seller) {
      throw new Error('Missing auth middleware call before controller function');
    }
    const { error } = validateTemplateOnly(req.body);
    if (error) {
      next(ErrorService.badRequest(error.details[0].message));
      return;
    }
    if (req.seller.prStatus !== STATUS_TMPLT_SELECTED) {
      next(new ErrorService(405, `Your Profile Status not in ${STATUS_TMPLT_SELECTED}`, NA));
      return;
    }
    const basic = {
      ...req.seller.basic,
      ...req.body.basic,
    };
    const body = {
      basic,
      prStatus: STATUS_TMPLT_SELECTED,
    };
    const upSeller = await SellerService.modify(
      req.seller._id,
      body,
    );

    logger.info(`Seller (${req.seller._id}) set new template`);

    res.status(200).send(upSeller);
  } catch (err) {
    next(ErrorService.internal(err.message));
  }
};

const setTemplate = async (req, res, next) => {
  try {
    if (!req.seller) {
      throw new Error('Missing auth middleware call before controller function');
    }

    const { error } = validateSetTemplate(req.body);

    if (error) {
      next(ErrorService.badRequest(error.details[0].message));
      return;
    }

    if (req.seller.prStatus === STATUS_TMPLT_SELECTED) {
      next(new ErrorService(409, 'Duplicate Action', DUP_ACTION));
      return;
    }

    if (req.seller.prStatus !== STATUS_PRO_DONE) {
      next(new ErrorService(405, `Your Profile Status not in ${STATUS_PRO_DONE}`, NA));
      return;
    }

    const basic = {
      ...req.seller.basic,
      ...req.body.basic,
    };

    const body = {
      basic,
      prStatus: STATUS_TMPLT_SELECTED,
    };

    const upSeller = await SellerService.modify(
      req.seller._id,
      body,
    );

    logger.info(`Seller (${req.seller._id}) set new template`);

    res.status(200).send(upSeller);
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

    let user = await SellerService.findByMobile(req.body.mobile);

    if (!user) {
      next(new ErrorService(404, 'The mobile number you entered isn\'t connected to an account.', USER_NF));
      return;
    }

    if (user.status === STATUS_REJECTED) {
      next(new ErrorService(401, 'Your account has been rejected. Contact BuyAsia team', REJECTED_ACC));
      return;
    }

    if (![STATUS_PENDING_APR, STATUS_ACTIVE].includes(user.status)) {
      next(new ErrorService(401, 'Your account is not activated yet', NOT_ACTIVE));
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
        type: TYPE_SELLER,
      },
      process.env.TOKEN_SECRET,
      { expiresIn: process.env.EXPIRES_IN },
    );

    user = user.toObject();
    delete user.password;

    logger.info(`Seller: ${user.mobile} successFully Logged In`);

    // // Add to Header
    res.header('x-authToken', token);
    res.status(200).send(user);
  } catch (err) {
    next(ErrorService.internal(err.message));
  }
};

const addInfo = async (req, res, next) => {
  try {
    if (!req.sellerId) {
      throw new Error('Missing auth middleware call before controller function');
    }

    const { error } = validateInfo(req.body);

    if (error) {
      next(new ErrorService(400, error.details[0].message, error.details[0].context.key));
      return;
    }

    const seller = await SellerService.findByBrno(toUpper(req.body.basic.brno));

    if (seller) {
      next(new ErrorService(409, 'Brno already exists', DUP_BRNO));
      return;
    }

    const body = {
      ...req.body,
      prStatus: STATUS_PRO_DONE,
    };

    const upSeller = await SellerService.modify(
      req.sellerId,
      body,
    );

    logger.info(`Modified seller document: ${req.sellerId}`);

    res.status(200).send(upSeller);
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

const getSellers = async (req, res, next) => {
  try {
    if (!req.auth) {
      throw new Error('Missing auth middleware call before controller function');
    }

    const { error } = validateGetSellers(req.query);

    if (error) {
      next(new ErrorService(400, error.details[0].message, error.details[0].context.key));
      return;
    }

    const result = await SellerService.getWpgn(
      req.query.skip,
      req.query.limit,
      req.query.from,
      req.query.to,
    );

    logger.info(`Attempt on ${req.method} ${req.originalUrl} is successfull`);

    res.status(200).send(result);
  } catch (err) {
    next(ErrorService.internal(err.message));
  }
};

const reviewSeller = async (req, res, next) => {
  try {
    if (!req.auth) {
      throw new Error('Missing auth middleware call before controller function');
    }

    const { error } = validateSellerReview(req.body);

    if (error) {
      next(new ErrorService(400, error.details[0].message, error.details[0].context.key));
      return;
    }

    const seller = await SellerService.find(req.body.sellerId);

    if (!seller) {
      next(new ErrorService(404, 'Seller not found', NF));
      return;
    }

    if ([STATUS_ACTIVE, STATUS_REJECTED].includes(seller.status)) {
      next(new ErrorService(409, 'Already reviewed this seller account', DUP_ACTION));
      return;
    }

    if (seller.prStatus !== STATUS_PRO_DONE) {
      next(new ErrorService(405, 'Seller is not updated account with relevant information yet', NA));
      return;
    }

    // const result = await SellerService.modify(req.body.sellerId, req.body.upSeller);

    // const task = {
    //   to: seller.email,
    //   subject: req.body.upSeller.status === STATUS_ACTIVE ? SUBJECT_ACTIVE : SUBJECT_REJECTED,
    //   template: req.body.upSeller.status === STATUS_ACTIVE ? TMPLT_SELLER_ACTIVE
    //     : TMPLT_SELLER_REJECTED,
    //   context: {
    //     title: req.body.upSeller.status === STATUS_ACTIVE ? SUBJECT_ACTIVE : SUBJECT_REJECTED,
    //     v_link: process.env.SELLER_BASE_URL,
    //     rejReason: req.body.upSeller.rejReason,
    //     name: result.basic.companyName,
    //     sender: SENDER_BUYASIA,
    //   },
    // };

    // mailQueue.push(task);

    const result = await SellerService.review(req.body);

    res.status(200).send(result);

    logger.info(`Attempt on ${req.method} ${req.originalUrl} is successfull`);
  } catch (err) {
    next(ErrorService.internal(err.message));
  }
};

const refreshSeller = async (req, res, next) => {
  try {
    if (!req.seller) {
      throw new Error('Missing auth middleware call before controller function');
    }

    let user = req.seller;

    user = user.toObject();

    delete user.password;

    logger.info(`Attempt on ${req.method} ${req.originalUrl} is successfull`);

    res.status(200).send(user);
  } catch (err) {
    next(ErrorService.internal(err.message));
  }
};

const validateToken = async (req, res, next) => {
  try {
    if (!req.seller) {
      res.status(401).send({ message: 'Invalid Token' });
    } else {
      res.status(200).send({ message: 'Valid Token' });
    }
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

    const user = await SellerService.findByMobile(trim(req.body.mobile));

    if (!user) {
      next(new ErrorService(404, 'User not exist', NF));
      return;
    }

    if (![STATUS_PENDING_APR, STATUS_ACTIVE].includes(user.status)) {
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

    const user = await SellerService.findByMobile(verified.mobile);

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

    const user = await SellerService.findByMobile(req.mobile);

    if (!user) {
      next(new ErrorService(404, 'User not exist', NF));
      return;
    }

    const password = bcrypt.hashSync(req.body.password, config.saltRounds);

    await SellerService.modifyByMobile(
      user.mobile,
      { password },
    );

    res.status(204).send();
    logger.info(`Attempt on ${req.method} ${req.originalUrl} is successfull`);
  } catch (err) {
    next(ErrorService.internal(err.message));
  }
};

const getSellerForBuyer = async (req, res, next) => {
  try {
    const user = await SellerService.findByIdForBuyer(req.params.sellerId);

    res.status(200).send(user);
    logger.info(`Attempt on ${req.method} ${req.originalUrl} is successfull`);
  } catch (err) {
    next(ErrorService.internal(err.message));
  }
};

module.exports = {
  init,
  verifyOtp,
  verifyEmail,
  pending,
  login,
  addInfo,
  getSellers,
  reviewSeller,
  setTemplate,
  refreshSeller,
  getOtp,
  compareOtp,
  resetPass,
  getSellerForBuyer,
  updateTemplate,
  updateSellerInfo,
  validateToken,
};
