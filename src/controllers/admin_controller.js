const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const ErrorService = require('../services/ErrorService');
const AdminService = require('../services/AdminService');
const { logger } = require('../utils/logger');
const { validateLogin, validateAddUser } = require('../validations/admin');
const {
  USER_NF,
  NOT_ACTIVE,
  INCORRECT_PASS,
  OTP_NF, DUP_OTP,
  EXP_OTP,
  INCORRECT_OTP,
  DUP_EMAIL,
  DUP_MOBILE,
  INVALID_STATUS,
  DUP_ACTION,
} = require('../constants/custom_errors');
const { STATUS_ACTIVE, STATUS_INITIATED, STATUS_EMAIL_VR } = require('../constants/status');
const OtpService = require('../services/OtpService');
const { encrypt, decrypt } = require('../services/CryptoService');
const SmsService = require('../services/SmsService');
const { verifyOtpValidation, validatePassword } = require('../validations/public');
const { CRYPTO_ERRORS, ERR_TOKEN_EXPIRED, INVALID_TOKEN } = require('../constants/error_codes');
const { TYPE_ADMIN, TYPE_SP_ADMIN } = require('../constants/user_types');
const { TMPLT_ADMIN_VERIFY } = require('../constants/templates');
const { SUBJECT_VERIFY } = require('../constants/subjects');
const { SENDER_BUYASIA } = require('../constants/senders');
const { mailQueue } = require('../queue');
const { UNAUTHORIZED, NA, CONFLICT } = require('../constants/http_codes');
const config = require('../config');

const login = async (req, res, next) => {
  try {
    const { error } = validateLogin(req.body);
    if (error) {
      next(ErrorService.badRequest(error.details[0].message));
      return;
    }

    let user = await AdminService.findByEmail(req.body.email);

    if (!user) {
      next(new ErrorService(404, 'The email you entered isn\'t connected to an account.', USER_NF));
      return;
    }

    if (user.status !== STATUS_ACTIVE || !user.password) {
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

    let response;

    if (user.type === TYPE_SP_ADMIN) {
      const otpAdded = await OtpService.add(10);

      // const smsService = new SmsService(user.mobile, `Your otp is ${otpAdded.otp}`);

      // await smsService.send();

      const details = {
        mobile: user.mobile,
        otpId: otpAdded._id,
      };

      const verifyKey = encrypt(JSON.stringify(details));

      response = { verifyKey };
    } else {
      const token = jwt.sign(
        {
          id: user._id,
          type: user.type,
        },
        process.env.TOKEN_SECRET,
        { expiresIn: process.env.EXPIRES_IN },
      );

      user = user.toObject();
      delete user.password;
      res.header('x-authToken', token);
      response = user;
    }

    res.status(200).send(response);

    logger.info(`Attempt on ${req.method} ${req.originalUrl} is successfull`);
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

    let user = await AdminService.findByMobile(verified.mobile);

    if (!user) {
      next(new ErrorService(404, 'User not found', USER_NF));
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

    await OtpService.modifyOtp(otp._id);

    const token = jwt.sign(
      {
        id: user._id,
        type: user.type,
      },
      process.env.TOKEN_SECRET,
      { expiresIn: process.env.EXPIRES_IN },
    );

    user = user.toObject();
    delete user.password;
    // // Add to Header
    res.header('x-authToken', token);
    res.status(200).send(user);
    logger.info(`Seller: ${user.mobile} successFully Logged In`);
  } catch (err) {
    if (CRYPTO_ERRORS.includes(err.code)) {
      next(ErrorService.badRequest('Invalid verifyKey'));
      return;
    }
    next(ErrorService.internal(err.message));
  }
};

const addUser = async (req, res, next) => {
  try {
    if (!req.auth) {
      throw new Error('Missing auth middleware call before controller function');
    }

    const { error } = validateAddUser(req.body);

    if (error) {
      next(new ErrorService(400, error.details[0].message, error.details[0].context.key));
      return;
    }

    const emailExists = await AdminService.findByEmail(req.body.email);

    if (emailExists) {
      next(new ErrorService(409, 'Email already exists', DUP_EMAIL));
      return;
    }

    if (req.body.mobile) {
      const mobileExists = await AdminService.findByMobile(req.body.mobile);

      if (mobileExists) {
        next(new ErrorService(409, 'Mobile already exists', DUP_MOBILE));
        return;
      }
    }

    const body = {
      ...req.body,
      type: TYPE_ADMIN,
    };

    const newAdmin = await AdminService.add(body);

    // const token = jwt.sign({ id: newAdmin._id }, process.env.TOKEN_SECRET);

    // const task = {
    //   to: body.email,
    //   subject: SUBJECT_VERIFY,
    //   template: TMPLT_ADMIN_VERIFY,
    //   context: {
    //     title: SUBJECT_VERIFY,
    //     firstName: body.firstName,
    //     v_link: `${process.env.DEV_URL}/api/admin/verify-email/${token}`,
    //     sender: SENDER_BUYASIA,
    //   },
    // };

    // mailQueue.push(task);

    logger.info(`Added new admin: ${newAdmin._id}`);

    res.status(200).send(newAdmin);
  } catch (err) {
    next(ErrorService.internal(err.message));
  }
};

const verifyEmail = async (req, res, next) => {
  try {
    const verified = jwt.verify(req.params.token, process.env.TOKEN_SECRET);

    const admin = await AdminService.find(verified.id);

    if (!admin) {
      next(new ErrorService(404, 'Admin not found', USER_NF));
      return;
    }

    if ([STATUS_EMAIL_VR, STATUS_ACTIVE].includes(admin.status)) {
      next(new ErrorService(409, 'Your email is already verified', DUP_ACTION));
      return;
    }

    if (admin.status !== STATUS_INITIATED) {
      next(new ErrorService(405, `User account is not in ${STATUS_INITIATED} status`, INVALID_STATUS));
      return;
    }

    const upAdmin = await AdminService.modify(
      admin._id,
      { status: STATUS_EMAIL_VR },
    );

    logger.info(`Change the status of admin document (${admin._id}) to ${STATUS_EMAIL_VR}`);

    res.redirect(`${process.env.ADMIN_BASE_URL}/activate/${req.params.token}`);

    // res.status(200).send(upAdmin);
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

const activate = async (req, res, next) => {
  try {
    const token = req.header('x-authToken');

    if (!token) {
      next(new ErrorService(401, 'Unauthorized access', UNAUTHORIZED));
      return;
    }

    const verified = jwt.verify(token, process.env.TOKEN_SECRET);

    const { error } = validatePassword(req.body);

    if (error) {
      next(ErrorService.badRequest(error.details[0].message));
      return;
    }

    const admin = await AdminService.find(verified.id);

    if (!admin) {
      next(new ErrorService(404, 'Admin not found', USER_NF));
      return;
    }

    if (admin.status === STATUS_INITIATED) {
      next(new ErrorService(405, 'Verify your email first', NA));
      return;
    }

    if (admin.status === STATUS_ACTIVE) {
      next(new ErrorService(409, 'Your account is alreay activated', DUP_ACTION));
      return;
    }

    if (admin.status !== STATUS_EMAIL_VR) {
      next(new ErrorService(405, `User account is not in ${STATUS_EMAIL_VR} status`, INVALID_STATUS));
      return;
    }

    const password = bcrypt.hashSync(req.body.password, config.saltRounds);

    const upAdmin = await AdminService.modify(
      admin._id,
      {
        password,
        status: STATUS_ACTIVE,
      },
    );

    logger.info(`Change the status of admin document (${admin._id}) to ${STATUS_ACTIVE}`);

    res.status(200).send(upAdmin);
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

const getUsers = async (req, res, next) => {
  try {
    if (!req.auth) {
      throw new Error('Missing auth middleware call before controller function');
    }

    const result = await AdminService.getWpgn(
      req.query.skip,
      req.query.limit,
      req.query.search,
    );

    logger.info(`Attempt on ${req.method} ${req.originalUrl} is successfull`);

    res.status(200).send(result);
  } catch (err) {
    next(ErrorService.internal(err.message));
  }
};

module.exports = {
  login, verifyOtp, addUser, verifyEmail, activate, getUsers,
};
