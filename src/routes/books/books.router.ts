import express from 'express';

// middlewares
import upload from '../../middlewares/uploadImage';
import { librarian, member } from '../../middlewares/auth';

import { getBooks, createBook, getBook, updateBook, deleteBook, borrowBook, returnBook } from './books.controller';

const booksRouter = express.Router();

booksRouter.get('/', getBooks);
booksRouter.get('/:id', getBook);

booksRouter.post('/', librarian, upload.single('image'), createBook);
booksRouter.post('/borrow', member, borrowBook);
booksRouter.post('/return', member, returnBook);

booksRouter.put('/:id', librarian, upload.single('image'), updateBook);

booksRouter.delete('/:id', librarian, deleteBook);

export default booksRouter;
