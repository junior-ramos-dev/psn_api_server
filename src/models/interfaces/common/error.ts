import { ValidationError } from "express-validator";
import { MongooseError } from "mongoose";

class RequestError extends Error {
  errors: ValidationError[];
  constructor(message: string, errors: ValidationError[]) {
    super(message);
    this.name = "RequestError";
    this.errors = errors;
  }
}

class AuthenticationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthenticationError";
  }
}

class PsnApiError extends Error {
  constructor(message: string, error?: string) {
    super(`${message}: ${error}`);
    this.name = "PsnApiError";
  }
}

// type Constructor<T = {}> = new (...args: any[]) => T;

const tryCatchErrorHandler = (catchError: unknown) => {
  console.log(catchError);

  let classErrorType = 0;

  if (catchError instanceof RequestError) classErrorType = 1;
  if (catchError instanceof AuthenticationError) classErrorType = 2;
  if (catchError instanceof PsnApiError) classErrorType = 3;
  if (catchError instanceof MongooseError) classErrorType = 4;

  switch (classErrorType) {
    case 1:
      throw catchError as RequestError;
    case 2:
      throw catchError as AuthenticationError;
    case 3:
      throw catchError as PsnApiError;
    case 4:
      throw catchError as MongooseError;
    default:
      throw new Error(`UnknownError: ${catchError}`);
  }
};

export { AuthenticationError, PsnApiError, RequestError, tryCatchErrorHandler };
