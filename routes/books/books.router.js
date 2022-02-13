import express from 'express';

// middlewares
import upload from './../../middlewares/uploadImage.js';
import { admin } from '../../middlewares/auth.js';

import { getBooks, createBook, getBook, updateBook, deleteBook } from './books.controller.js';

const booksRouter = express.Router();

booksRouter.get('/', getBooks);
booksRouter.post('/', admin, upload.single('image'), createBook);
booksRouter.get('/:id', getBook);
booksRouter.put('/:id', admin, updateBook);
booksRouter.delete('/:id', admin, deleteBook);

export default booksRouter;
