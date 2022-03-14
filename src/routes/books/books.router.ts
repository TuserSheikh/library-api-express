import express from 'express';

// middlewares
import upload from '../../middlewares/uploadImage';
import { admin, librarian, member } from '../../middlewares/auth';

import { getBooks, createBook, getBook, updateBook, deleteBook, borrowBook, returnBook } from './books.controller';

const booksRouter = express.Router();

booksRouter.get('/', getBooks);
booksRouter.post('/', librarian, upload.single('image'), createBook);
booksRouter.get('/:id', getBook);
booksRouter.put('/:id', librarian, updateBook);
booksRouter.delete('/:id', librarian, deleteBook);

booksRouter.post('/borrow', member, borrowBook);
booksRouter.post('/return', member, returnBook);

export default booksRouter;
