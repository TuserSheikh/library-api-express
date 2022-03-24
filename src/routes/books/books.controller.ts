import { unlink } from 'fs/promises';
import { NextFunction, Request, Response } from 'express';
import { z, ZodError } from 'zod';

import { BadRequest, InternalServerError, NotFound } from '../../utils/errors';
import { BookModel } from '../../models/books.model';
import { UserModel } from '../../models/users.model';

async function getBooks(req: Request, res: Response, next: NextFunction) {
  const trimString = (u: unknown) => (typeof u === 'string' ? u.trim() : u);
  const bookSchema = z.object({
    title: z.preprocess(trimString, z.string().min(1).optional()),
    author: z.preprocess(trimString, z.string().min(1).optional()),
  });

  try {
    const { title, author } = await bookSchema.parseAsync(req.query);

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
    if (err instanceof ZodError) {
      return next(new BadRequest(err.flatten()));
    } else if (err instanceof Error) {
      return next(new BadRequest(err.message));
    }

    console.error(err);
  }
}

async function createBook(req: Request, res: Response, next: NextFunction) {
  const path = req.file?.path;

  if (!path) {
    return next(new BadRequest('image is required'));
  }

  const trimString = (u: unknown) => (typeof u === 'string' ? u.trim() : u);
  const isNumberString = (input: unknown) => z.string().regex(/^\d+$/).safeParse(input).success;
  const numberFromNumberOrNumberString = (input: unknown) => {
    if (isNumberString(input)) return Number(input);
    return input;
  };
  const bookSchema = z.object({
    title: z.preprocess(trimString, z.string().min(1)),
    author: z.preprocess(trimString, z.string().min(1)),
    qty: z.preprocess(numberFromNumberOrNumberString, z.number().positive().int().max(100).optional()),
  });

  try {
    const bookData = await bookSchema.parseAsync(req.body);
    bookData.qty = bookData.qty ?? 1;

    const book = await BookModel.createBook({ ...bookData, imgUrl: path });

    if (book) {
      book.imgUrl = `${req.protocol}://${req.get('host')}/${book.imgUrl}`;
      return res.status(201).json({ data: book });
    }

    return next(new BadRequest('Book already exits'));
  } catch (err) {
    try {
      await unlink(path);
    } catch (err) {
      console.error('image delete error from createBook of books.controller', err);
    }

    if (err instanceof ZodError) {
      return next(new BadRequest(err.flatten()));
    } else if (err instanceof Error) {
      return next(new BadRequest(err.message));
    }

    console.error(err);
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

  const isNumberString = (input: unknown) => z.string().regex(/^\d+$/).safeParse(input).success;
  const numberFromNumberOrNumberString = (input: unknown) => {
    if (isNumberString(input)) return Number(input);
    return input;
  };
  const qtySchema = z.object({
    qty: z.preprocess(numberFromNumberOrNumberString, z.number().positive().int().max(100).optional()),
  });

  try {
    const { qty } = await qtySchema.parseAsync(req.body);

    const newDocument: { imgUrl?: string; qty?: number } = { qty };
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

    if (err instanceof ZodError) {
      return next(new BadRequest(err.flatten()));
    } else if (err instanceof Error) {
      return next(new BadRequest(err.message));
    }

    console.error(err);
  }
}

async function borrowBook(req: Request, res: Response, next: NextFunction) {
  const userId = req.currentUser._id;
  const bookId = req.body.booksId;

  const user = await UserModel.getUser(userId);

  if (!user) {
    return next(new BadRequest('user not found'));
    // TODO
    // logout
    // return authentication error
  }

  const book = await BookModel.getBook(bookId);
  if (!book) {
    return next(new BadRequest('Book not found'));
  }

  if (book.borrow.length >= book.qty) {
    return next(new BadRequest('Book is not available'));
  }

  const bookBorrowLimit = process.env.BOOK_BORROW_LIMIT || 5;
  if (user.borrow.length >= bookBorrowLimit) {
    return next(new BadRequest('Book borrowing limit exceed'));
  }

  const alreadyBorrowed = user.borrow.find(borrow => borrow.bookId === bookId);
  if (alreadyBorrowed) {
    return next(new BadRequest('This book is already borrowed'));
  }

  const isBorrow = await BookModel.borrowBook(userId, bookId);

  if (isBorrow) {
    return res.sendStatus(204);
  }

  return next(new InternalServerError());
}

async function returnBook(req: Request, res: Response, next: NextFunction) {
  const userId = req.currentUser._id;
  const bookId = req.body.booksId;

  const user = await UserModel.getUser(userId);

  if (!user) {
    return next(new BadRequest('user not found'));
    // logout
    // return authentication error
  }

  const book = await BookModel.getBook(bookId);
  if (!book) {
    return next(new BadRequest('Book not found'));
  }

  const alreadyBorrowed = user.borrow.find(borrow => borrow.bookId === bookId);
  if (!alreadyBorrowed) {
    return next(new BadRequest('This book is not borrowed'));
  }

  const isReturn = await BookModel.returnBook(userId, bookId);

  if (isReturn) {
    return res.sendStatus(204);
  }

  return next(new InternalServerError());
}

export { getBooks, createBook, getBook, updateBook, deleteBook, borrowBook, returnBook };
