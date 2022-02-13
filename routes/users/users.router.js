import express from 'express';

import { getUsers, signupUser, signinUser, getUser, updateUser, deleteUser } from './users.controller.js';
import { admin, member } from '../../middlewares/auth.js';

const usersRouter = express.Router();

usersRouter.post('/signin', signinUser);
usersRouter.post('/signup', signupUser);

usersRouter.get('/', admin, getUsers);
usersRouter.get('/:id', member, getUser);
usersRouter.put('/:id', admin, updateUser);
usersRouter.delete('/:id', admin, deleteUser);

export default usersRouter;
