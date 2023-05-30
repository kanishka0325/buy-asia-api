const NOT_ACTIVE = 'NOT_ACTIVE_USER';
const NOT_INIT = 'ACCOUNT_NOT_INITIATED';
const NOT_OTP_VR = 'NOT_OTP_VERIFIED';
const NOT_PWD = 'NO_PASSWORD';
const DUP_ACTION = 'DUPLICATE_ACTION';
const PR_NOT_INITIATE = 'PROFILE_STATUS_NOT_INITIATED';
const USER_NF = 'USER_NOT_FOUND';
const OTP_NF = 'OTP_NOT_FOUND';
const INCORRECT_OTP = 'OTP_NOT_MATCHED';
const INCORRECT_PASS = 'PASSWORD_NOT_MATCHED';
const DUP_MOBILE = 'DUPLICATE_MOBILE';
const DUP_EMAIL = 'DUPLICATE_EMAIL';
const DUP_OTP = 'OTP_ALREADY_VERIFIED';
const DUP_BRNO = 'DUPLICATE_BRNO';
const EXP_OTP = 'OTP_EXPIRED';
const INVALID_STATUS = 'INVALID_ACCOUNT_STATUS';
const PROD_CAT_NF = 'PRODUCT_CATEGORY_NOT_FOUND';
const PROD_SUB_CAT_NF = 'PRODUCT_SUB_CATEGORY_NOT_FOUND';
const PROD_GROUP_NF = 'PRODUCT_GROUP_NOT_FOUND';
const DUP_PRCODE = 'DUPLICATE_PRODUCT_CODE';
const PROD_NF = 'PRODUCT_NOT_FOUND';
const DUP_BRAND_NAME = 'DUPLICATE_BRAND_NAME';
const INVALID_CATS = 'INVALID_CATEGORIES';
const PROD_BRAND_NF = 'PRODUCT_BRAND_NOT_FOUND';
const PROD_BRAND_CAT_MM = 'PRODUCT_BRAND_AND_CATEGORY_MISMATCH';
const DUP_MOBILE_OR_EMAIL = 'DUPLICATE_MOBILE_OR_EMAIL';
const INVALID_OID = 'INVALID_OBJECT_ID';
const INVOICE_NF = 'INVOICE_NOT_FOUND';
const REVIEW_NA = 'REVIEW_NOT_ALLOWED';
const REJECTED_ACC = 'ACCOUNT_REJECTED';
const INV_REC_NF = 'INVOICE RECORD NOT FOUND';
const RATING_CONFLICT = 'INVOICE RECORD ALREADY RATED';
const BRAND_REVIEW_CONFLICT = 'TEMPORARY BRAND ALREAY REVIEWED';
const TEMP_BRAND_NF = 'TEMPORARY BRAND NOT FOUND';
const MSG_LIMIT_EXCEEDED = 'PROVIDED MESSAGE LIMIT EXCEEDED';

module.exports = {
  NOT_ACTIVE,
  NOT_INIT,
  NOT_OTP_VR,
  DUP_ACTION,
  PR_NOT_INITIATE,
  USER_NF,
  OTP_NF,
  INCORRECT_OTP,
  INCORRECT_PASS,
  DUP_MOBILE,
  DUP_EMAIL,
  DUP_OTP,
  DUP_BRNO,
  EXP_OTP,
  INVALID_STATUS,
  PROD_CAT_NF,
  PROD_SUB_CAT_NF,
  PROD_GROUP_NF,
  DUP_PRCODE,
  PROD_NF,
  DUP_BRAND_NAME,
  INVALID_CATS,
  PROD_BRAND_NF,
  PROD_BRAND_CAT_MM,
  DUP_MOBILE_OR_EMAIL,
  INVALID_OID,
  INVOICE_NF,
  REVIEW_NA,
  REJECTED_ACC,
  INV_REC_NF,
  RATING_CONFLICT,
  BRAND_REVIEW_CONFLICT,
  TEMP_BRAND_NF,
  NOT_PWD,
  MSG_LIMIT_EXCEEDED,
};
