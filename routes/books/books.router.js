import express from 'express';
import multer from 'multer';
import path from 'path';

import { nanoid } from 'nanoid';

import {
  getBooks,
  createBook,
  getBook,
  updateBook,
  deleteBook,
} from './books.controller.js';

const booksRouter = express.Router();

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

booksRouter.get('/', getBooks);
booksRouter.post('/', upload.single('image'), createBook);
booksRouter.get('/:id', getBook);
booksRouter.put('/:id', updateBook);
booksRouter.delete('/:id', deleteBook);

export default booksRouter;
