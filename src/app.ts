// node modules
import express from 'express';
import morgan from 'morgan';
import { createWriteStream } from 'fs';

// middlewares
import handleErrors from './middlewares/handleErrors';

// local files
import { calculateFineJob } from './utils/cornJobs';
import booksRouter from './routes/books/books.router';
import usersRouter from './routes/users/users.router';

const app = express();
const logStream = createWriteStream('logs/access.log', { flags: 'a' });

calculateFineJob.start();

app.use(express.json());
app.use(morgan('combined', { stream: logStream }));

app.use('/images', express.static('images'));

app.use('/books', booksRouter);
app.use('/users', usersRouter);

app.use(handleErrors);

export default app;
