import { getAll, getById } from '../../models/mongodb.js';

async function getBooks(req, res) {
  const books = await getAll('books');
  return await res.status(200).json(books);
}

function createBook() {}

async function getBook(req, res) {
  const bookId = req.params.id;
  const book = await getById('books', bookId);
  return await res.status(200).json(book);
}

async function updateBook() {}

async function deleteBook() {}

export { getBooks, createBook, getBook, updateBook, deleteBook };
