import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

import { Forbidden, Unauthorized } from '../utils/errors';
import { IUser } from '../models/users.model';
import { UserRole } from '../utils/enums';

function admin(req: Request, res: Response, next: NextFunction) {
  const { authorization } = req.headers;

  try {
    const token = authorization?.split(' ')[1];

    if (!token) {
      return next(new Unauthorized());
    }

    const { currentUser } = jwt.verify(token, process.env.JWT_SECRET || '') as { currentUser: IUser };

    if (currentUser.role > UserRole.Admin) {
      return next(new Forbidden());
    }

    req.currentUser = currentUser;
    next();
  } catch (err) {
    console.error(err);
    return next(new Unauthorized());
  }
}

function librarian(req: Request, res: Response, next: NextFunction) {
  const { authorization } = req.headers;

  try {
    const token = authorization?.split(' ')[1];

    if (!token) {
      return next(new Unauthorized());
    }

    const { currentUser } = jwt.verify(token, process.env.JWT_SECRET || '') as { currentUser: IUser };

    console.log(currentUser);

    if (currentUser.role > UserRole.Librarian) {
      return next(new Forbidden());
    }

    req.currentUser = currentUser;
    next();
  } catch (err) {
    console.error(err);
    return next(new Unauthorized());
  }
}

function member(req: Request, res: Response, next: NextFunction) {
  const { authorization } = req.headers;

  try {
    const token = authorization?.split(' ')[1];

    if (!token) {
      return next(new Unauthorized());
    }

    const { currentUser } = jwt.verify(token, process.env.JWT_SECRET || '') as { currentUser: IUser };

    if (currentUser.role > UserRole.Member) {
      return next(new Forbidden());
    }

    req.currentUser = currentUser;

    next();
  } catch (err) {
    console.error(err);
    return next(new Unauthorized());
  }
}

export { admin, librarian, member };
