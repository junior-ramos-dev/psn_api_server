import { Request, Response } from "express";

const errorHandler = (
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

class AuthenticationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthenticationError";
  }
}

class PsnAuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PSN Error";
  }
}

export { AuthenticationError, errorHandler, PsnAuthError };
