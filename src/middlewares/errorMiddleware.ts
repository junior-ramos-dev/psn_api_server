import { NextFunction, Request, Response } from "express";

import {
  AuthenticationError,
  PsnApiError,
  RequestError,
} from "@/models/interfaces/common/error";

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error(err.stack);

  if (err instanceof RequestError) {
    return res.status(422).json({
      name: err.name,
      message: err.message,
      errors: err.errors,
    });
    // res.status(500).json({ err });
  } else if (err instanceof AuthenticationError || err instanceof PsnApiError) {
    res
      .status(401)
      .json({ name: err.name, message: `Unauthorized: ${err.message}` });
  } else {
    res.status(500).json({ name: err.name, message: "Internal Server Error" });
  }
  next();
};
