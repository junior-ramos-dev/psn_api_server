import { Request, Response } from "express";
import jwt from "jsonwebtoken";

import {
  controllersErrorHandler,
  ERROR_CLASS_NAME,
} from "@/models/interfaces/common/error";
import { PsnAuth } from "@/services/psnApi/psnAuth";
import { loadPsnUserDataOnRegister } from "@/services/repositories/bulk/game";
import {
  createDbUserAndProfile,
  getDbUserByEmail,
  getDbUserByPsnOnlineId,
  getDbUserProfileByUserId,
} from "@/services/repositories/userRepository";
import { IS_NODE_ENV_PRODUCTION } from "@/utils/env";

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

/**
 * Register an user
 *
 * @param req
 * @param res
 * @returns
 */
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

  // Get NPSSO code set in the session
  const NPSSO = req.session.npsso;

  // Check if NPSSO exists
  if (NPSSO) {
    // Initialize the PSN credentials for using with psn_api
    PSN_AUTH = await PsnAuth.createPsnAuth(NPSSO).then((psnAuth) => psnAuth);

    // Create user profile
    const data = await createDbUserAndProfile(psnOnlineId, email, password);

    if (data && "userDb" in data && "userProfileDb" in data) {
      const { userDb, userProfileDb } = data;

      try {
        // Load the games and trophy user data from PSN and insert on DB
        await loadPsnUserDataOnRegister(String(userDb._id));
      } catch (error) {
        console.log(error);
        const resObj = controllersErrorHandler(error);
        return res.status(resObj.status).json(resObj);
      }

      generateToken(res, String(userDb._id));
      return res.status(201).json({
        user: {
          id: userDb._id,
          psnOnlineId: userDb.psnOnlineId,
          email: userDb.email,
        },
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

/**
 * Login an user
 *
 * @param req
 * @param res
 * @returns
 */
const loginUser = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const user = await getDbUserByEmail(email);

  if (user && (await user.comparePassword(password))) {
    // Get NPSSO code set in the session
    const NPSSO = req.session.npsso;

    // Check if NPSSO exists
    if (NPSSO) {
      // Initialize the PSN credentials for using with psn_api
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
      user: {
        id: user._id,
        psnOnlineId: user.psnOnlineId,
        email: user.email,
      },
      profile: userDbProfile,
    });
  } else {
    return res.status(401).json({
      name: ERROR_CLASS_NAME.MONGO_DB,
      message: "User not found / password incorrect",
    });
  }
};

/**
 * Logout an user
 *
 * @param req
 * @param res
 * @returns
 */
const logoutUser = async (req: Request, res: Response) => {
  // Unset the PSN credentials used with psn_api
  if (PSN_AUTH) PSN_AUTH = PsnAuth.clearPsnAuth(PSN_AUTH);

  clearToken(res);
  req.session.destroy((err) => {
    if (err) console.log(`Session Destroy Error: ${err}`);
  });
  return res
    .status(200)
    .json({ name: "Authentication", message: "User logged out" });
};

export { loginUser, logoutUser, PSN_AUTH, registerUser };
