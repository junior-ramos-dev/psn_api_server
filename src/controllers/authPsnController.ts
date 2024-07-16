import { Request, Response, NextFunction } from "express";
import { getAuthCredentials } from "../auth/authPsn";
// import Auth from "../models/auth";

const getAcessToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const auth = await getAuthCredentials();
  if (auth) res.json(auth);
  else res.sendStatus(404);
};

export { getAcessToken };
