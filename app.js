import express from 'express';

import booksRouter from './routes/books/books.router.js';

const app = express();

app.use(express.json());
app.use('/books', booksRouter);

export default app;
