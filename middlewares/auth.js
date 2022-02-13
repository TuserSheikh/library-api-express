import jwt from 'jsonwebtoken';
import { Forbidden, Unauthorized } from '../utils/errors.js';

function admin(req, res, next) {
  const { authorization } = req.headers;

  try {
    const token = authorization.split(' ')[1];
    const user = jwt.verify(token, process.env.JWT_SECRET);

    if (user.role !== 'admin') {
      return next(new Forbidden());
    }

    req.loggedinUser = user;
    next();
  } catch (err) {
    console.error(err);
    return next(new Unauthorized());
  }
}

function member(req, res, next) {
  const { authorization } = req.headers;

  try {
    const token = authorization.split(' ')[1];
    const user = jwt.verify(token, process.env.JWT_SECRET);

    req.loggedinUser = user;

    next();
  } catch (err) {
    console.error(err);
    return next(new Unauthorized());
  }
}

export { admin, member };
