const multer = require('multer');

const diskStorage = (dest) => multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, dest);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const memoryStorage = () => multer.memoryStorage();

module.exports = {
  diskStorage, memoryStorage,
};
