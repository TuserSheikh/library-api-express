import multer from 'multer';
import path from 'path';
import { nanoid } from 'nanoid';

import { BadRequest } from '../utils/errors';

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'images');
  },

  filename: function (req, file, cb) {
    const fileExt = path.extname(file.originalname);
    const uniqueId = nanoid();
    const newFileName = uniqueId + fileExt;

    cb(null, newFileName);
  },
});

const upload = multer({
  storage,
  fileFilter: function (req, file, cb) {
    var ext = path.extname(file.originalname);
    if (ext !== '.png' && ext !== '.jpg' && ext !== '.jpeg') {
      return cb(new BadRequest('Only .png .jpg and .jpeg images are allowed'));
    }
    cb(null, true);
  },
  limits: {
    fileSize: 1024 * 1024,
  },
});

export default upload;
