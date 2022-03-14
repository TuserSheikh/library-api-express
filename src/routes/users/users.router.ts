import express from 'express';

import { getUsers, signupUser, signinUser, getUser, updateUser, deleteUser, payFine } from './users.controller';
import { admin, member } from '../../middlewares/auth';

const usersRouter = express.Router();

usersRouter.post('/signin', signinUser);
usersRouter.post('/signup', signupUser);

usersRouter.get('/', admin, getUsers);
usersRouter.get('/:id', member, getUser);
usersRouter.put('/:id', admin, updateUser);
usersRouter.delete('/:id', admin, deleteUser);

usersRouter.post('/fine', member, payFine);

export default usersRouter;
