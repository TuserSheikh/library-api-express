import { getAll, getById, create, deleteById } from '../../models/mongodb.js';

const collectionName = 'books';

async function getBooks(req, res) {
  const books = await getAll(collectionName);
  return await res.status(200).json({ data: books });
}

async function createBook(req, res) {
  const { title, author } = req.body;

  const book = await create(collectionName, { title, author });

  return res.status(201).json({
    data: {
      createdId: book.insertedId,
    },
  });
}

async function getBook(req, res) {
  const bookId = req.params.id;
  const book = await getById(collectionName, bookId);

  if (book) {
    return await res.status(200).json({ data: book });
  }

  return res.status(404).json({
    error: {
      message: 'book not found',
    },
  });
}

async function updateBook(req, res) {}

async function deleteBook(req, res) {
  const bookId = req.params.id;
  const book = await deleteById(collectionName, bookId);

  if (book.value) {
    return await res.status(204);
  }

  return res.status(404).json({
    error: {
      message: 'book not found',
    },
  });
}

export { getBooks, createBook, getBook, updateBook, deleteBook };
