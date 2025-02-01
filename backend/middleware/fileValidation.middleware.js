const multer = require('multer');
const { maxFileSize, allowedExtensions } = require('../config/excel.config');

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const ext = '.' + file.originalname.split('.').pop().toLowerCase();
  
  if (!allowedExtensions.includes(ext)) {
    return cb(new Error('Invalid file type. Only .xlsx files are allowed.'), false);
  }
  
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: maxFileSize
  }
});

module.exports = upload; 