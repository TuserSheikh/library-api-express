import { GeneralError } from '../utils/errors';
import { ErrorRequestHandler } from 'express';

const handleErrors: ErrorRequestHandler = (err, req, res, next) => {
  if (err instanceof GeneralError) {
    return res.status(err.code).json({
      error: {
        message: err.message,
      },
    });
  }

  return res.status(500).json({
    error: {
      message: err.message,
    },
  });
};

export default handleErrors;
