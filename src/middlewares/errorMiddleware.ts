import { Request, Response } from "express";

import {
  AuthenticationError,
  PsnAuthError,
} from "@/models/interfaces/common/error";

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response
  // next: NextFunction
) => {
  console.error(err.stack);

  if (err instanceof AuthenticationError || err instanceof PsnAuthError) {
    res.status(401).json({ message: "Unauthorized: " + err.message });
  } else {
    res.status(500).json({ message: "Internal Server Error" });
  }
};
