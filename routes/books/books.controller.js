import { unlink } from 'fs/promises';
import Joi from 'joi';

import { BadRequest, NotFound } from '../../utils/errors.js';
import { getAll, getById, create, deleteById } from '../../models/mongodb.js';
import { borrowBook as borrowBookModel, returnbook } from '../../models/books.model.js';

const collectionName = 'books';

async function getBooks(req, res) {
  const { title, author } = req.query;

  const condition = {};
  if (title) {
    condition.title = new RegExp(title);
  }
  if (author) {
    condition.author = new RegExp(author);
  }

  const books = (await getAll(collectionName, condition)).map(book => {
    book.path = `${req.protocol}://${req.get('host')}/${book.path}`;
    return book;
  });

  return await res.status(200).json({ data: books });
}

async function createBook(req, res, next) {
  const path = req.file ? req.file.path : null;

  if (!path) {
    return next(new BadRequest('image (.png|.jpg|.jpeg) is required'));
  }

  const { title, author } = req.body;

  const schema = Joi.object({
    title: Joi.string().required(),
    author: Joi.string().required(),
  });

  try {
    const value = await schema.validateAsync({ title, author });

    const book = await create(collectionName, { ...value, path });

    return res.status(201).json({
      data: {
        createdId: book.insertedId,
      },
    });
  } catch (err) {
    try {
      await unlink(path);
    } catch (err) {
      console.error('image delete error from createBook function', err);
    }

    next(new BadRequest(err.message));
  }
}

async function getBook(req, res, next) {
  const bookId = req.params.id;
  const book = await getById(collectionName, bookId);

  if (book) {
    book.path = `${req.protocol}://${req.get('host')}/${book.path}`;
    return await res.status(200).json({ data: book });
  }

  next(new NotFound('book not found'));
}

async function updateBook(req, res, next) {
  const bookId = req.params.id;

  next(new NotFound('book not found'));
}

async function deleteBook(req, res, next) {
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

async function borrowBook(req, res, next) {
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

  if (user.borrow.includes(bookId)) {
    return next(new BadRequest('this book is already borrowed'));
  }

  await borrowBookModel(userId, bookId);
  res.sendStatus(204);
}

async function returnBook(req, res, next) {}

export { getBooks, createBook, getBook, updateBook, deleteBook, borrowBook, returnBook };
