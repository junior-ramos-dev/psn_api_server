import { Request, Response } from "express";
import jwt from "jsonwebtoken";

import { ERROR_CLASS_NAME } from "@/models/interfaces/common/error";
import { PsnAuth } from "@/services/psnApi/psnAuth";
import {
  createDbUserAndProfile,
  getDbUserByEmail,
  getDbUserByPsnOnlineId,
  getDbUserProfileByUserId,
} from "@/services/repositories/userRepository";
import { IS_NODE_ENV_PRODUCTION } from "@/utils/env";
import { getBearerTokenFromHeader } from "@/utils/http";

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

  if (onlineIdExists) {
    return res.status(400).json({
      name: ERROR_CLASS_NAME.MONGO_DB,
      message: `An account with PSN Username '${psnOnlineId}' already exists!`,
    });
  }
  if (userEmailExists) {
    return res.status(400).json({
      name: ERROR_CLASS_NAME.MONGO_DB,
      message: `An account with email '${email}' already exists!`,
    });
  }

  const authorization = req.headers["authorization"];

  // Check if NPSSO exists
  if (authorization) {
    const NPSSO = getBearerTokenFromHeader(authorization);
    // Initialize the PSN credentials for using with psn_api
    PSN_AUTH = await PsnAuth.createPsnAuth(NPSSO).then((psnAuth) => psnAuth);

    // Create user profile
    const data = await createDbUserAndProfile(psnOnlineId, email, password);

    if (data && "userDb" in data && "userProfileDb" in data) {
      const { userDb, userProfileDb } = data;
      generateToken(res, String(userDb._id));
      return res.status(201).json({
        id: userDb._id,
        // psnOnlineId: userDb.psnOnlineId,
        email: userDb.email,
        profile: userProfileDb,
      });
    } else {
      return res.status(400).json({
        name: ERROR_CLASS_NAME.MONGO_DB,
        message: "An error occurred in creating the account",
      });
    }
  } else {
    return res.status(401).json({
      name: ERROR_CLASS_NAME.PSN_API,
      message: "An error occurred in creating the account: Missing 'NPSSO'",
    });
  }
};

const loginUser = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const user = await getDbUserByEmail(email);

  if (user && (await user.comparePassword(password))) {
    // Get the PSN credentials for using with psn_api
    const authorization = req.headers["authorization"];

    if (authorization) {
      const NPSSO = getBearerTokenFromHeader(authorization);
      PSN_AUTH = await PsnAuth.createPsnAuth(NPSSO).then((psnAuth) => psnAuth);
    } else {
      return res.status(401).json({
        name: ERROR_CLASS_NAME.PSN_API,
        message: "An error occurred in login: Missing 'NPSSO'",
      });
    }

    const userDbProfile = await getDbUserProfileByUserId(String(user._id));

    generateToken(res, String(user._id));
    return res.status(201).json({
      id: user._id,
      // psnOnlineId: user.psnOnlineId,
      email: user.email,
      profile: userDbProfile,
    });
  } else {
    return res.status(401).json({
      name: ERROR_CLASS_NAME.MONGO_DB,
      message: "User not found / password incorrect",
    });
  }
};

const logoutUser = async (req: Request, res: Response) => {
  // Unset the PSN credentials used with psn_api
  if (PSN_AUTH) PSN_AUTH = PsnAuth.clearPsnAuth(PSN_AUTH);

  clearToken(res);
  return res
    .status(200)
    .json({ name: "Authentication", message: "User logged out" });
};

export { loginUser, logoutUser, PSN_AUTH, registerUser };
