import { Request, Response } from "express";

import { User } from "@/models/schemas/user";
import {
  getPsnAccountIdByUsername,
  getPsnProfileByAccountId,
  getPsnProfileByUsername,
} from "@/services/repositories/userRepository";

/**
 *
 * @param req
 * @param res
 */
const getAppUser = async (req: Request, res: Response) => {
  const userId = req.user?._id;
  const user = await User.findById(userId, {
    psnUsername: 1,
    email: 1,
    _id: 0,
  });

  if (!user) {
    res.status(400);
  }

  res.status(200).json(user);
};

/**
 *
 * @param req
 * @param res
 */
const getPsnUserAccountId = async (req: Request, res: Response) => {
  try {
    const psnUsername = req.params["psnUsername"];

    const accountId = await getPsnAccountIdByUsername(psnUsername);

    if (!accountId) {
      res.status(400);
    }

    res.status(200).json(accountId);
  } catch (error) {
    console.log(error);
  }
};

/**
 *
 * @param req
 * @param res
 */
const getPsnUserProfileByAccountId = async (req: Request, res: Response) => {
  try {
    const accountId = req.params["accountId"];

    const userProfile = await getPsnProfileByAccountId(accountId);

    if (!userProfile) {
      res.status(400);
    }

    res.status(200).json(userProfile);
  } catch (error) {
    console.log(error);
  }
};

/**
 *
 * @param req
 * @param res
 */
const getPsnUserProfileByUsername = async (req: Request, res: Response) => {
  try {
    const psnUsername = req.params["psnUsername"];

    const userProfile = await getPsnProfileByUsername(psnUsername);

    if (!userProfile) {
      res.status(400);
    }

    res.status(200).json(userProfile);
  } catch (error) {
    console.log(error);
  }
};

export {
  getAppUser,
  getPsnUserAccountId,
  getPsnUserProfileByAccountId,
  getPsnUserProfileByUsername,
};
