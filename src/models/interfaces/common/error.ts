import { ValidationError } from "express-validator";
import { MongooseError } from "mongoose";

export enum ERROR_CLASS_TYPE {
  REQUEST = 1,
  AUTHENTICATION = 2,
  PSN_API = 3,
  MONGO_DB = 4,
}

export enum ERROR_CLASS_NAME {
  REQUEST = "RequestError",
  AUTHENTICATION = "AuthenticationError",
  PSN_API = "PsnApiError",
  MONGO_DB = "MongoDbError",
  UNKNOWN = "UnknownError",
}

class RequestError extends Error {
  errors: ValidationError[];
  constructor(message: string, errors: ValidationError[]) {
    super(message);
    this.name = ERROR_CLASS_NAME.REQUEST;
    this.errors = errors;
  }
  self = () => this;
}

class AuthenticationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = ERROR_CLASS_NAME.AUTHENTICATION;
  }
  self = () => this;
}

class PsnApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = ERROR_CLASS_NAME.PSN_API;
  }
  self = () => this;
}

class MongoDbError extends MongooseError {
  constructor(message: string) {
    super(message);
    this.name = ERROR_CLASS_NAME.MONGO_DB;
  }
  self = () => this;
}

class UnknownError extends Error {
  constructor(message: string) {
    super(message);
    this.name = ERROR_CLASS_NAME.UNKNOWN;
  }
  self = () => this;
}

/**
 * Cast the error type 'unknown' to an error class
 *
 * @param error
 */
const castErrorUnknownToErrorClass = (error: unknown) => {
  console.log(error);

  let errorClassType = 0;
  let errorClass;

  if (error instanceof RequestError) {
    errorClassType = ERROR_CLASS_TYPE.REQUEST;
    errorClass = error.self();
  }

  if (error instanceof AuthenticationError) {
    errorClassType = ERROR_CLASS_TYPE.AUTHENTICATION;
    errorClass = error.self();
  }
  if (error instanceof PsnApiError) {
    errorClassType = ERROR_CLASS_TYPE.PSN_API;
    errorClass = error.self();
  }
  if (error instanceof MongoDbError) {
    errorClassType = ERROR_CLASS_TYPE.MONGO_DB;
    errorClass = error.self();
  }

  return { errorClassType, errorClass };
};

/**
 * Handle the error for services
 *
 * @param error
 */
const servicesErrorHandler = (error: unknown) => {
  console.log(error);

  const { errorClassType, errorClass } = castErrorUnknownToErrorClass(error);

  switch (errorClassType) {
    case ERROR_CLASS_TYPE.REQUEST:
      throw errorClass; //RequestError
    case ERROR_CLASS_TYPE.AUTHENTICATION:
      throw errorClass; //AuthenticationError
    case ERROR_CLASS_TYPE.PSN_API:
      throw errorClass; //PsnApiError
    case ERROR_CLASS_TYPE.MONGO_DB:
      throw errorClass; //MongoDbError;
    default:
      throw new UnknownError(`${error}`); //UnknownError
  }
};

export { AuthenticationError, PsnApiError, RequestError, servicesErrorHandler };
