import multer from 'multer';
import path from 'path';
import { nanoid } from 'nanoid';

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

const upload = multer({ storage });

export default upload;
