import express from 'express';

// middlewares
import upload from './../../middlewares/uploadImage.js';
import { admin, member } from '../../middlewares/auth.js';

import { getBooks, createBook, getBook, updateBook, deleteBook, borrowBook, returnBook } from './books.controller.js';

const booksRouter = express.Router();

booksRouter.get('/', getBooks);
booksRouter.post('/', admin, upload.single('image'), createBook);
booksRouter.get('/:id', getBook);
booksRouter.put('/:id', admin, updateBook);
booksRouter.delete('/:id', admin, deleteBook);

booksRouter.post('/borrow', member, borrowBook);
booksRouter.post('/return', member, returnBook);

export default booksRouter;
