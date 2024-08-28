import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { MongooseError } from "mongoose";

import { PsnAuth } from "@/services/psnApi/psnAuth";
import {
  createDbUserAndProfile,
  getDbUserByEmail,
  getDbUserByPsnOnlineId,
} from "@/services/repositories/userRepository";
import { IS_NODE_ENV_PRODUCTION } from "@/utils/env";
import { getBearerTokenFromHeader } from "@/utils/http";

//TODO Error handling / return response

let PSN_AUTH: PsnAuth;

const generateToken = (res: Response, userId: string) => {
  const jwtSecret = process.env.JWT_SECRET ?? "";
  const token = jwt.sign({ userId }, jwtSecret, {
    expiresIn: "1h",
  });

  res.cookie("jwt", token, {
    httpOnly: true,
    secure: IS_NODE_ENV_PRODUCTION,
    sameSite: "strict",
    maxAge: 60 * 60 * 1000,
  });
};

const clearToken = (res: Response) => {
  res.cookie("jwt", "", {
    httpOnly: true,
    expires: new Date(0),
  });
};

const registerUser = async (req: Request, res: Response) => {
  const { psnOnlineId, email, password } = req.body;
  const onlineIdExists = await getDbUserByPsnOnlineId(psnOnlineId);
  const userEmailExists = await getDbUserByEmail(email);

  if (onlineIdExists && !(onlineIdExists instanceof MongooseError)) {
    return res.status(400).json({
      message: `An account with PSN Username '${psnOnlineId}' already exists!`,
    });
  }
  if (userEmailExists && !(userEmailExists instanceof MongooseError)) {
    return res
      .status(400)
      .json({ message: `An account with email '${email}' already exists!` });
  }

  const authorization = req.headers["authorization"];

  // Check if NPSSO exists
  if (authorization) {
    const NPSSO = getBearerTokenFromHeader(authorization);
    // Initialize the PSN credentials for using with psn_api
    PSN_AUTH = await PsnAuth.createPsnAuth(NPSSO).then((psnAuth) => psnAuth);

    // Create user profile
    const data = await createDbUserAndProfile(psnOnlineId, email, password);

    if ("userDb" in data) {
      const { userDb } = data;
      generateToken(res, String(userDb._id));
      return res.status(201).json({
        id: userDb._id,
        psnOnlineId: userDb.psnOnlineId,
        email: userDb.email,
      });
    } else {
      return res
        .status(400)
        .json({ message: "An error occurred in creating the account" });
    }
  } else {
    return res.status(401).json({
      message: "An error occurred in creating the account: Missing 'NPSSO'",
    });
  }
};

const loginUser = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const user = await getDbUserByEmail(email);

  if (
    user &&
    !(user instanceof MongooseError) &&
    (await user.comparePassword(password))
  ) {
    // Get the PSN credentials for using with psn_api
    const authorization = req.headers["authorization"];

    if (authorization) {
      const NPSSO = getBearerTokenFromHeader(authorization);
      PSN_AUTH = await PsnAuth.createPsnAuth(NPSSO).then((psnAuth) => psnAuth);
    } else {
      return res
        .status(401)
        .json({ message: "An error occurred in login: Missing 'NPSSO'" });
    }

    generateToken(res, String(user._id));
    return res.status(201).json({
      id: user._id,
      psnOnlineId: user.psnOnlineId,
      email: user.email,
    });
  } else {
    return res
      .status(401)
      .json({ message: "User not found / password incorrect" });
  }
};

const logoutUser = async (req: Request, res: Response) => {
  // Unset the PSN credentials used with psn_api
  if (PSN_AUTH) PSN_AUTH = PsnAuth.clearPsnAuth(PSN_AUTH);

  clearToken(res);
  return res.status(200).json({ message: "User logged out" });
};

export { loginUser, logoutUser, PSN_AUTH, registerUser };
