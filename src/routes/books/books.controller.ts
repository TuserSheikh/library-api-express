import { unlink } from 'fs/promises';
import Joi from 'joi';
import { NextFunction, Request, Response } from 'express';

import { BadRequest, NotFound } from '../../utils/errors';
import { BookModel } from '../../models/books.model';
import { MongoServerError } from 'mongodb';

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
  const book = await BookModel.getBook(bookId);

  if (book) {
    book.imgUrl = `${req.protocol}://${req.get('host')}/${book.imgUrl}`;
    return res.status(200).json({ data: book });
  }

  next(new NotFound('book not found'));
}

async function deleteBook(req: Request, res: Response, next: NextFunction) {
  const bookId = req.params.id;
  const book = await BookModel.deleteBook(bookId);

  if (book) {
    try {
      await unlink(book.imgUrl);
    } catch (err) {
      console.error('image delete error from deleteBook of book model', err);
    }

    return res.sendStatus(204);
  }

  next(new NotFound('book not found'));
}

async function updateBook(req: Request, res: Response, next: NextFunction) {
  const bookId = req.params.id;
  const book = await BookModel.getBook(bookId);
  const path = req.file?.path;

  if (!book) {
    next(new NotFound('book not found'));
  }

  const schema = Joi.object({
    qty: Joi.number().positive().integer(),
  });

  try {
    const value = await schema.validateAsync(req.body);

    const newDocument: { imgUrl?: string; qty?: number } = { ...value };
    if (path) {
      newDocument.imgUrl = path; // add new image
    }

    const updatedBook = await BookModel.updateBook(bookId, newDocument);

    if (updatedBook) {
      updatedBook.imgUrl = `${req.protocol}://${req.get('host')}/${updatedBook.imgUrl}`;

      // delete previous image
      if (path && book) {
        try {
          path && (await unlink(book.imgUrl));
        } catch (err) {
          console.error('image delete error from updateBook of books.controller', err);
        }
      }
    }

    return res.status(200).json({ data: updatedBook });
  } catch (err) {
    try {
      path && (await unlink(path));
    } catch (err) {
      console.error('image delete error from createBook of books.controller', err);
    }

    if (err instanceof Error) {
      next(new BadRequest(err.message));
    }
  }
}

async function borrowBook(req: Request, res: Response, next: NextFunction) {
  //   const userId = req.loggedinUser._id;
  //   const bookId = req.body.booksId;
  //   const book = await getById('books', bookId);
  //   const user = await getById('users', userId);
  //   if (!book) {
  //     return next(new BadRequest('book not found'));
  //   }
  //   if (book.borrow.length >= book.qty) {
  //     return next(new BadRequest('book is not available'));
  //   }
  //   const bookBorrowLimit = process.env.BOOK_BORROW_LIMIT || 5;
  //   if (user.borrow.length >= bookBorrowLimit) {
  //     return next(new BadRequest('book borrowing limit exceed'));
  //   }
  //   const alreadyBorrowed = user.borrow.find(borrow => borrow.bookId === bookId);
  //   if (alreadyBorrowed) {
  //     return next(new BadRequest('this book is already borrowed'));
  //   }
  //   await borrowBookModel(userId, bookId);
  //   res.sendStatus(204);
}

async function returnBook(req: Request, res: Response, next: NextFunction) {
  //   const userId = req.loggedinUser._id;
  //   const bookId = req.body.booksId;
  //   const book = await getById('books', bookId);
  //   const user = await getById('users', userId);
  //   if (!book) {
  //     return next(new BadRequest('book not found'));
  //   }
  //   const alreadyBorrowed = user.borrow.find(borrow => borrow.bookId === bookId);
  //   if (!alreadyBorrowed) {
  //     return next(new BadRequest('this book is not borrowed'));
  //   }
  //   await returnBookModel(userId, bookId);
  //   res.sendStatus(204);
}

export { getBooks, createBook, getBook, updateBook, deleteBook, borrowBook, returnBook };
