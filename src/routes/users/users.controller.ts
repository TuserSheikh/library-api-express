import Joi from 'joi';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

import { BadRequest, Unauthorized, NotFound, Forbidden } from '../../utils/errors';
import { getAll, getById, create, update, deleteById, getByField } from '../../models/mongodb';
import { emailSend } from '../../utils/mail';
import { payFine as payFineModel, UserModel } from '../../models/users.model';
import { UserRole } from '../../utils/enums';
import { MongoServerError } from 'mongodb';

const collectionName = 'users';

async function getUsers(req: Request, res: Response, next: NextFunction) {
  const schema = Joi.object({
    name: Joi.string().trim(),
  });

  try {
    const { name } = await schema.validateAsync(req.query);

    const condition: { name?: RegExp } = {};

    if (name) {
      condition.name = new RegExp(name);
    }

    const users = await UserModel.getAllUsers(condition);

    return res.status(200).json({ data: users });
  } catch (err) {
    if (err instanceof Error) {
      next(new BadRequest(err.message));
    }
  }
}

async function getUser(req: Request, res: Response, next: NextFunction) {
  const userId = req.params.id;

  const currentUser = await UserModel.getUser(req.currentUser._id);

  if (!currentUser) {
    // logout
  }

  if (currentUser && currentUser.role !== UserRole.Admin && currentUser._id.toString() !== userId) {
    return next(new Forbidden());
  }

  const user = await UserModel.getUser(userId);

  if (user) {
    return res.status(200).json({ data: user });
  }

  return next(new NotFound('user not found'));
}

async function signupUser(req: Request, res: Response, next: NextFunction) {
  const schema = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  });

  try {
    const value = await schema.validateAsync(req.body);
    value.password = await bcrypt.hash(value.password, 10);

    const user = await UserModel.createUser({ ...value });

    // await emailSend(
    //   createdUser.email,
    //   'Need Approval',
    //   'Account created successfully but need admin approval to active.'
    // );

    return res.status(201).json({
      data: user,
    });
  } catch (err) {
    if (err instanceof MongoServerError) {
      if (err.code === 11000) {
        next(new BadRequest('User already exits'));
      }
      next(new BadRequest(err.message));
    } else if (err instanceof Error) {
      next(new BadRequest(err.message));
    }
  }
}

async function signinUser(req: Request, res: Response, next: NextFunction) {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  });

  try {
    const value = await schema.validateAsync(req.body);
    const user = await UserModel.getByEmail(value.email);

    if (user) {
      const isValidUser = await bcrypt.compare(value.password, user.password);
      if (!isValidUser) {
        return next(new Unauthorized('Authentication Failed'));
      }

      if (!user.isActive) {
        return next(new BadRequest('User deactivated'));
      }

      jwt.sign({ currentUser: user }, process.env.JWT_SECRET || '', { expiresIn: '10h' }, function (err, token) {
        if (err) {
          console.error(err);
          return next(new Unauthorized('Authentication Failed'));
        }

        return res.status(200).json({
          data: {
            accessToken: token,
            tokenType: 'Bearer',
          },
        });
      });
    } else {
      return next(new BadRequest('User not found'));
    }
  } catch (err) {
    if (err instanceof Error) {
      return next(new BadRequest(err.message));
    }
  }
}

async function updateUser(req: Request, res: Response, next: NextFunction) {
  // const userId = req.params.id;
  // const user = await getById(collectionName, userId);
  // if (!user) {
  //   return next(new NotFound('user not found'));
  // }
  // const schema = Joi.object({
  //   isActive: Joi.boolean().required(),
  // });
  // try {
  //   const value = await schema.validateAsync(req.body);
  //   const updateIserActiveStatus = {
  //     $set: value,
  //   };
  //   await update(collectionName, userId, updateIserActiveStatus);
  //   return res.sendStatus(204);
  // } catch (err) {
  //   next(new BadRequest(err.message));
  // }
}

async function deleteUser(req: Request, res: Response, next: NextFunction) {
  const userId = req.params.id;
  const user = await UserModel.delete(userId);

  if (user) {
    return res.sendStatus(204);
  }

  return next(new NotFound('user not found'));
}

async function payFine(req: Request, res: Response, next: NextFunction) {
  // const userId = req.loggedinUser._id;
  // const fine = req.body.fine;
  // const user = await getById('users', userId);
  // const schema = Joi.object({
  //   fine: Joi.number().integer().greater(0).min(user.fine).max(user.fine).required(),
  // });
  // try {
  //   await schema.validateAsync({ fine });
  //   await payFineModel(user);
  //   return res.sendStatus(204);
  // } catch (err) {
  //   next(new BadRequest(err.message));
  // }
}

export { getUsers, signupUser, signinUser, getUser, updateUser, deleteUser, payFine };
