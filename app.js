import express from 'express';
import morgan from 'morgan';
import { createWriteStream } from 'fs';

import booksRouter from './routes/books/books.router.js';

const app = express();
const logStream = createWriteStream('logs/access.log', { flags: 'a' });

app.use(express.json());

app.use(morgan('combined', { stream: logStream }));
app.use(morgan('combined'));

app.use('/images', express.static('images'));
app.use('/books', booksRouter);

export default app;
