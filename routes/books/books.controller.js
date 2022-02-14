import { unlink } from 'fs/promises';
import Joi from 'joi';

import { BadRequest, NotFound } from '../../utils/errors.js';
import { getAll, getById, create, deleteById } from '../../models/mongodb.js';

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

export { getBooks, createBook, getBook, updateBook, deleteBook };
