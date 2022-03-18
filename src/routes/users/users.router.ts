import express from 'express';

import { getUsers, signupUser, signinUser, getUser, updateUser, deleteUser, payFine } from './users.controller';
import { admin, member } from '../../middlewares/auth';

const usersRouter = express.Router();

usersRouter.get('/', admin, getUsers);
usersRouter.get('/:id', member, getUser);

usersRouter.post('/fine', member, payFine);
usersRouter.post('/signin', signinUser);
usersRouter.post('/signup', signupUser);

// usersRouter.put('/:id', admin, updateUser);

usersRouter.delete('/:id', admin, deleteUser);

export default usersRouter;
