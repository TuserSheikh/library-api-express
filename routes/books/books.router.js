import express from 'express';

// middlewares
import upload from './../../middlewares/uploadImage.js';

import {
  getBooks,
  createBook,
  getBook,
  updateBook,
  deleteBook,
} from './books.controller.js';

const booksRouter = express.Router();

booksRouter.get('/', getBooks);
booksRouter.post('/', upload.single('image'), createBook);
booksRouter.get('/:id', getBook);
booksRouter.put('/:id', updateBook);
booksRouter.delete('/:id', deleteBook);

export default booksRouter;
