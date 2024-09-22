import { ValidationError } from "express-validator";
import { MongooseError } from "mongoose";

export enum ERROR_CLASS_TYPE {
  UNKNOWN = 0,
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

export interface IErrorResponse {
  status: number;
  name: string;
  message: string;
  errors?: ValidationError[];
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
  className: string;
  constructor(message: string) {
    super(message);
    this.className = ERROR_CLASS_NAME.MONGO_DB;
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
  let errorClassType = -1;
  let errorClass;

  if (error instanceof RequestError) {
    errorClassType = ERROR_CLASS_TYPE.REQUEST;
    errorClass = error.self();
  } else if (error instanceof AuthenticationError) {
    errorClassType = ERROR_CLASS_TYPE.AUTHENTICATION;
    errorClass = error.self();
  } else if (error instanceof PsnApiError) {
    errorClassType = ERROR_CLASS_TYPE.PSN_API;
    errorClass = error.self();
  } else if (error instanceof MongooseError) {
    errorClassType = ERROR_CLASS_TYPE.MONGO_DB;
    errorClass = new MongoDbError(error.message);
  } else {
    errorClassType = ERROR_CLASS_TYPE.UNKNOWN;
    errorClass = new UnknownError(`${error}`);
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
    case ERROR_CLASS_TYPE.REQUEST: {
      const requestError = errorClass;
      throw requestError; //RequestError
    }

    case ERROR_CLASS_TYPE.AUTHENTICATION: {
      const authenticationError = errorClass;
      throw authenticationError; //AuthenticationError
    }

    case ERROR_CLASS_TYPE.PSN_API: {
      const psnApiError = errorClass;
      throw psnApiError; //PsnApiError
    }

    case ERROR_CLASS_TYPE.MONGO_DB: {
      const mongoDbError = errorClass;
      throw mongoDbError; //MongoDbError
    }
    default:
      throw errorClass; //UnknownError;
  }
};

const controllersErrorHandler = (error: unknown) => {
  const { errorClassType, errorClass } = castErrorUnknownToErrorClass(error);

  const resErrorObj: IErrorResponse = {
    status: 400,
    name: "Error",
    message: "Error message",
  };

  if (errorClass) {
    switch (errorClassType) {
      case ERROR_CLASS_TYPE.REQUEST: {
        const reqError = errorClass as RequestError;
        resErrorObj.status = 422;
        resErrorObj.name = reqError.name;
        resErrorObj.message = reqError.message;
        resErrorObj.errors = reqError.errors;

        break;
      }

      case ERROR_CLASS_TYPE.AUTHENTICATION: {
        resErrorObj.status = 401;
        resErrorObj.name = ERROR_CLASS_NAME.AUTHENTICATION;
        resErrorObj.message = `Unauthorized: ${errorClass.message}`;

        break;
      }

      case ERROR_CLASS_TYPE.PSN_API: {
        resErrorObj.status = 400;
        resErrorObj.name = ERROR_CLASS_NAME.PSN_API;
        resErrorObj.message = `${errorClass.message}`;

        break;
      }

      case ERROR_CLASS_TYPE.MONGO_DB: {
        resErrorObj.status = 400;
        resErrorObj.name = ERROR_CLASS_NAME.MONGO_DB;
        resErrorObj.message = `${errorClass.message}`;

        break;
      }

      case ERROR_CLASS_TYPE.UNKNOWN: {
        resErrorObj.status = 400;
        resErrorObj.name = ERROR_CLASS_NAME.UNKNOWN;
        resErrorObj.message = `${errorClass.message}`;

        break;
      }

      default: {
        resErrorObj.status = 400;
        resErrorObj.name = "Error";
        resErrorObj.message = `${error}`;

        break;
      }
    }
  }
  return resErrorObj;
};

export {
  AuthenticationError,
  controllersErrorHandler,
  MongoDbError,
  PsnApiError,
  RequestError,
  servicesErrorHandler,
};
