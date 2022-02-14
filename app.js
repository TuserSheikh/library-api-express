// node modules
import express from 'express';
import morgan from 'morgan';
import { createWriteStream } from 'fs';

// middlewares
import handleErrors from './middlewares/handleErrors.js';

// local files
import booksRouter from './routes/books/books.router.js';
import usersRouter from './routes/users/users.router.js';

const app = express();
const logStream = createWriteStream('logs/access.log', { flags: 'a' });

app.use(express.json());
app.use(morgan('combined', { stream: logStream }));
app.use(morgan('combined'));
app.use('/images', express.static('images'));

app.use('/books', booksRouter);
app.use('/users', usersRouter);
app.use(handleErrors);

export default app;
