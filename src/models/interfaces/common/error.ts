import { ValidationError } from "express-validator";
import { MongooseError } from "mongoose";

class RequestError extends Error {
  errors: ValidationError[];
  constructor(message: string, errors: ValidationError[]) {
    super(message);
    this.name = "RequestError";
    this.errors = errors;
  }
  self = () => this;
}

class AuthenticationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthenticationError";
  }
  self = () => this;
}

class PsnApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PsnApiError";
  }
  self = () => this;
}

class MongoDbError extends MongooseError {
  constructor(message: string) {
    super(message);
    this.name = "MongoDbError";
  }
  self = () => this;
}

class UnknownError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UnknownError";
  }
  self = () => this;
}

// type Constructor<T = {}> = new (...args: any[]) => T;

const tryCatchErrorHandler = (catchError: unknown) => {
  console.log(catchError);

  let classErrorType = 0;
  let classError;

  if (catchError instanceof RequestError) {
    classErrorType = 1;
    classError = catchError.self();
  }

  if (catchError instanceof AuthenticationError) {
    classErrorType = 2;
    classError = catchError.self();
  }
  if (catchError instanceof PsnApiError) {
    classErrorType = 3;
    classError = catchError.self();
  }
  if (catchError instanceof MongoDbError) {
    classErrorType = 4;
    classError = catchError.self();
  }

  switch (classErrorType) {
    case 1:
      throw classError; //RequestError
    case 2:
      throw classError; //AuthenticationError
    case 3:
      throw classError; //PsnApiError
    case 4:
      throw classError; //MongoDbError;
    default:
      throw new UnknownError(`${catchError}`); //UnknownError
  }
};

export { AuthenticationError, PsnApiError, RequestError, tryCatchErrorHandler };
