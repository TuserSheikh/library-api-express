class GeneralError extends Error {
  message!: string;
  code!: number
}

class BadRequest extends GeneralError {
  constructor(message: string = 'bad request') {
    super();
    this.message = message;
    this.code = 400;
  }
}

class Unauthorized extends GeneralError {
  constructor(message: string = 'authentication failed') {
    super();
    this.message = message;
    this.code = 401;
  }
}
class Forbidden extends GeneralError {
  constructor(message: string = 'access denied') {
    super();
    this.message = message;
    this.code = 403;
  }
}

class NotFound extends GeneralError {
  constructor(message: string = 'not found') {
    super();
    this.message = message;
    this.code = 404;
  }
}

class InternalServerError extends GeneralError {
  constructor(message: string = 'internal server error') {
    super();
    this.message = message;
    this.code = 500;
  }
}

export { GeneralError, BadRequest, Unauthorized, Forbidden, NotFound, InternalServerError };
