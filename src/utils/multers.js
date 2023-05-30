const multer = require('multer');
const ErrorService = require('../services/ErrorService');

const pdfMulter = (getStorage) => multer({
  storage: getStorage(),
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== 'application/pdf') {
      cb(ErrorService.badRequest('Only .pdf format allowed!'), false);
    } else {
      cb(null, true);
    }
  },
});

module.exports = {
  pdfMulter,
};
