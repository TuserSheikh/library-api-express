import { unlink } from 'fs/promises';
import Joi from 'joi';
import { NextFunction, Request, Response } from 'express';

import { BadRequest, NotFound } from '../../utils/errors';
import { getAll, getById, create, deleteById } from '../../models/mongodb';
import { borrowBook as borrowBookModel, returnbook as returnBookModel, BookModel } from '../../models/books.model';
import { join } from 'path';
import { MongoServerError } from 'mongodb';

const collectionName = 'books';

async function getBooks(req: Request, res: Response, next: NextFunction) {
  const schema = Joi.object({
    title: Joi.string().trim(),
    author: Joi.string().trim(),
  });

  try {
    const { title, author } = await schema.validateAsync(req.query);

    const condition: {
      title?: RegExp;
      author?: RegExp;
    } = {};

    if (title) {
      condition.title = new RegExp(title);
    }

    if (author) {
      condition.author = new RegExp(author);
    }

    const books = await BookModel.getAllBooks(condition);

    const data = books.map(book => {
      book.imgUrl = `${req.protocol}://${req.get('host')}/${book.imgUrl}`;
      return book;
    });

    return res.status(200).json({ data });
  } catch (err) {
    if (err instanceof Error) {
      next(new BadRequest(err.message));
    }
  }
}

async function createBook(req: Request, res: Response, next: NextFunction) {
  const path = req.file?.path;

  if (!path) {
    return next(new BadRequest('image is required'));
  }

  const schema = Joi.object({
    title: Joi.string().required(),
    author: Joi.string().required(),
    qty: Joi.number().positive().integer(),
  });

  try {
    const value = await schema.validateAsync(req.body);
    value.qty = value.qty ?? 1;

    const book = await BookModel.createBook({ ...value, imgUrl: path, borrow: [] });
    book.imgUrl = `${req.protocol}://${req.get('host')}/${book.imgUrl}`;

    return res.status(201).json({ data: book });
  } catch (err) {
    try {
      await unlink(path);
    } catch (err) {
      console.error('image delete error from createBook of books.controller', err);
    }

    if (err instanceof MongoServerError) {
      if (err.code === 11000) {
        next(new BadRequest('Book already exits'));
      }
      next(new BadRequest(err.message));
    } else if (err instanceof Error) {
      next(new BadRequest(err.message));
    }
  }
}

async function getBook(req: Request, res: Response, next: NextFunction) {
  const bookId = req.params.id;
  const book = await getById(collectionName, bookId);

  if (book) {
    book.path = `${req.protocol}://${req.get('host')}/${book.path}`;
    return await res.status(200).json({ data: book });
  }

  next(new NotFound('book not found'));
}

async function updateBook(req: Request, res: Response, next: NextFunction) {
  const bookId = req.params.id;

  next(new NotFound('book not found'));
}

async function deleteBook(req: Request, res: Response, next: NextFunction) {
  const bookId = req.params.id;
  const book = await deleteById(collectionName, bookId);

  if (book?.value) {
    try {
      await unlink(book.value.path);
    } catch (err) {
      console.error('image delete error from deleteBook function', err);
    }

    return await res.sendStatus(204);
  }

  next(new NotFound('book not found'));
}

async function borrowBook(req: Request, res: Response, next: NextFunction) {
  const userId = req.loggedinUser._id;
  const bookId = req.body.booksId;

  const book = await getById('books', bookId);
  const user = await getById('users', userId);

  if (!book) {
    return next(new BadRequest('book not found'));
  }

  if (book.borrow.length >= book.qty) {
    return next(new BadRequest('book is not available'));
  }

  const bookBorrowLimit = process.env.BOOK_BORROW_LIMIT || 5;
  if (user.borrow.length >= bookBorrowLimit) {
    return next(new BadRequest('book borrowing limit exceed'));
  }

  const alreadyBorrowed = user.borrow.find(borrow => borrow.bookId === bookId);
  if (alreadyBorrowed) {
    return next(new BadRequest('this book is already borrowed'));
  }

  await borrowBookModel(userId, bookId);

  res.sendStatus(204);
}

async function returnBook(req: Request, res: Response, next: NextFunction) {
  const userId = req.loggedinUser._id;
  const bookId = req.body.booksId;

  const book = await getById('books', bookId);
  const user = await getById('users', userId);

  if (!book) {
    return next(new BadRequest('book not found'));
  }

  const alreadyBorrowed = user.borrow.find(borrow => borrow.bookId === bookId);
  if (!alreadyBorrowed) {
    return next(new BadRequest('this book is not borrowed'));
  }

  await returnBookModel(userId, bookId);

  res.sendStatus(204);
}

export { getBooks, createBook, getBook, updateBook, deleteBook, borrowBook, returnBook };
