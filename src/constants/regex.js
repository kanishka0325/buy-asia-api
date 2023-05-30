const MUST_HAVE_LETTERS = /^(?=.*[a-zA-Z])[a-zA-Z\d\s\-_!@#$%^&*()+=?.,:®;/[\]{}|\\`~]*$/;
const MOBILE_REGEX = /^\d{10,15}$/;
const ZIP_REGEX = /^[0-9]+$/;

module.exports = {
  MUST_HAVE_LETTERS,
  MOBILE_REGEX,
  ZIP_REGEX,
};
