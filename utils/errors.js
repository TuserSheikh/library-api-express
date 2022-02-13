class GeneralError extends Error {}

class BadRequest extends GeneralError {
  constructor(message = 'bad request') {
    super();
    this.message = message;
    this.code = 400;
  }
}

class Unauthorized extends GeneralError {
  constructor(message = 'authentication failed') {
    super();
    this.message = message;
    this.code = 401;
  }
}
class Forbidden extends GeneralError {
  constructor(message = 'access denied') {
    super();
    this.message = message;
    this.code = 403;
  }
}

class NotFound extends GeneralError {
  constructor(message = 'not found') {
    super();
    this.message = message;
    this.code = 404;
  }
}

class InternalServerError extends GeneralError {
  constructor(message = 'internal server error') {
    super();
    this.message = message;
    this.code = 500;
  }
}

export { GeneralError, BadRequest, Unauthorized, Forbidden, NotFound, InternalServerError };
