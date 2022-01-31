import express from 'express';

import {
  getBooks,
  createBook,
  getBook,
  updateBook,
  deleteBook,
} from './books.controller.js';

const booksRouter = express.Router();

booksRouter.get('/', getBooks);
booksRouter.post('/', createBook);
booksRouter.get('/:id', getBook);
booksRouter.put('/:id', updateBook);
booksRouter.delete('/:id', deleteBook);

export default booksRouter;
