import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { z, ZodError } from 'zod';

import { BadRequest, Unauthorized, NotFound, Forbidden } from '../../utils/errors';
import { emailSend } from '../../utils/mail';
import { UserModel } from '../../models/users.model';
import { UserRole } from '../../utils/enums';

async function getUsers(req: Request, res: Response, next: NextFunction) {
  const trimString = (u: unknown) => (typeof u === 'string' ? u.trim() : u);
  const nameSchema = z.object({
    name: z.preprocess(trimString, z.string().min(1).optional()),
  });

  try {
    const { name } = await nameSchema.parseAsync(req.query);

    const condition: { name?: RegExp } = {};
    if (name) {
      condition.name = new RegExp(name, 'i');
    }

    const users = await UserModel.getAllUsers(condition);

    return res.status(200).json({ data: users });
  } catch (err) {
    if (err instanceof ZodError) {
      return next(new BadRequest(err.flatten()));
    } else if (err instanceof Error) {
      return next(new BadRequest(err.message));
    }

    console.error(err);
  }
}

async function getUser(req: Request, res: Response, next: NextFunction) {
  const userId = req.params.id;

  const currentUser = await UserModel.getUser(req.currentUser._id);

  if (!currentUser) {
    //TODO
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
  const trimString = (u: unknown) => (typeof u === 'string' ? u.trim() : u);
  const userSchema = z.object({
    name: z.preprocess(trimString, z.string().min(2)),
    email: z.preprocess(trimString, z.string().email()),
    password: z.preprocess(trimString, z.string().min(6)),
  });

  try {
    const newUser = await userSchema.parseAsync(req.body);
    newUser.password = await bcrypt.hash(newUser.password, 10);

    const user = await UserModel.createUser({ ...newUser });

    //TODO email send
    // await emailSend(
    //   createdUser.email,
    //   'Need Approval',
    //   'Account created successfully but need admin approval to active.'
    // );

    if (user) {
      return res.status(201).json({
        data: user,
      });
    }
    return next(new BadRequest('User already exits'));
  } catch (err) {
    if (err instanceof ZodError) {
      return next(new BadRequest(err.flatten()));
    } else if (err instanceof Error) {
      return next(new BadRequest(err.message));
    }

    console.error(err);
  }
}

async function signinUser(req: Request, res: Response, next: NextFunction) {
  const trimString = (u: unknown) => (typeof u === 'string' ? u.trim() : u);
  const userSchema = z.object({
    email: z.preprocess(trimString, z.string().email()),
    password: z.preprocess(trimString, z.string()),
  });
  // const schema = Joi.object({
  //   email: Joi.string().email().required(),
  //   password: Joi.string().required(),
  // });

  try {
    const signinUser = await userSchema.parseAsync(req.body);
    // const value = await schema.validateAsync(req.body);
    const user = await UserModel.getByEmail(signinUser.email);

    if (user) {
      const isValidUser = await bcrypt.compare(signinUser.password, user.password);
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
    if (err instanceof ZodError) {
      return next(new BadRequest(err.flatten()));
    } else if (err instanceof Error) {
      return next(new BadRequest(err.message));
    }

    console.error(err);
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
  const user = await UserModel.getUser(req.currentUser._id);

  if (user) {
    const fineInput = req.body.fine;
    const fineSchema = z.object({
      fine: z.number().positive().int().min(1).max(user.fine),
    });

    try {
      const { fine } = await fineSchema.parseAsync({ fine: fineInput });
      const newFine = user.fine - fine;

      const updatedUser = await UserModel.payFine(user._id, newFine);

      return res.status(200).json({ data: updatedUser });
    } catch (err) {
      if (err instanceof ZodError) {
        return next(new BadRequest(err.flatten()));
      } else if (err instanceof Error) {
        return next(new BadRequest(err.message));
      }

      console.error(err);
    }
  }

  return next(new NotFound('User not found'));
}

export { getUsers, signupUser, signinUser, getUser, updateUser, deleteUser, payFine };
