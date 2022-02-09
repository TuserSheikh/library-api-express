import { GeneralError } from '../utils/errors.js';

const handleErrors = (err, req, res, next) => {
  if (err instanceof GeneralError) {
    return res.status(err.getCode()).json({
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
