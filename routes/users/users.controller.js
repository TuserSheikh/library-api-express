import Joi from 'joi';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import { BadRequest, Unauthorized, NotFound, Forbidden } from '../../utils/errors.js';
import { getAll, getById, create, deleteById, getByField } from '../../models/mongodb.js';
import { emailSend } from '../../utils/mail.js';
import { payFine as payFineModel } from '../../models/users.model.js';

const collectionName = 'users';

async function getUsers(req, res) {
  const users = await getAll(collectionName);
  return await res.status(200).json({ data: users });
}

async function signupUser(req, res, next) {
  const schema = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  });

  try {
    const value = await schema.validateAsync(req.body);
    value.password = await bcrypt.hash(value.password, 10);

    const user = await create(collectionName, { ...value, role: 'member', isActive: false, borrow: [], fine: 0 });

    if (!user) {
      next(new BadRequest(`"${value.email}" already exists`));
    }

    const createdUser = await getById('users', user.insertedId);

    await emailSend(
      createdUser.email,
      'Need Approval',
      'Account created successfully but need admin approval to active.'
    );

    return res.status(201).json({
      data: {
        createdId: user.insertedId,
      },
    });
  } catch (err) {
    next(new BadRequest(err.message));
  }
}

async function signinUser(req, res, next) {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  });

  try {
    const value = await schema.validateAsync(req.body);
    const user = await getByField(collectionName, 'email', value.email);

    if (user) {
      if (!user.isActive) {
        return next(new BadRequest('user deactivated'));
      }

      const isValidUser = await bcrypt.compare(value.password, user.password);
      if (!isValidUser) {
        return next(new Unauthorized('Authentication Failed'));
      }

      jwt.sign({ ...user }, process.env.JWT_SECRET, { expiresIn: '1h' }, function (err, token) {
        console.error(err);
        return res.status(200).json({
          data: {
            accessToken: token,
            tokenType: 'Bearer',
          },
        });
      });
    } else {
      return next(new BadRequest('email not found'));
    }
  } catch (err) {
    return next(new BadRequest(err.message));
  }
}

async function getUser(req, res, next) {
  const userId = req.params.id;

  if (req.loggedinUser.role === 'member' && req.loggedinUser._id !== userId) {
    return next(new Forbidden());
  }

  const user = await getById(collectionName, userId);

  if (user) {
    return await res.status(200).json({ data: user });
  }

  return next(new NotFound('user not found'));
}

async function updateUser(req, res, next) {
  const userId = req.params.id;

  return next(new NotFound('user not found'));
}

async function deleteUser(req, res, next) {
  const userId = req.params.id;
  const user = await deleteById(collectionName, userId);

  if (user?.value) {
    return await res.sendStatus(204);
  }

  return next(new NotFound('user not found'));
}

async function payFine(req, res, next) {
  const userId = req.loggedinUser._id;
  const fine = req.body.fine;
  const user = await getById('users', userId);

  const schema = Joi.object({
    fine: Joi.number().integer().greater(0).min(user.fine).max(user.fine).required(),
  });

  try {
    await schema.validateAsync({ fine });
    await payFineModel(user);
    return res.sendStatus(204);
  } catch (err) {
    next(new BadRequest(err.message));
  }
}

export { getUsers, signupUser, signinUser, getUser, updateUser, deleteUser, payFine };
