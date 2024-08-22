import { Request, Response } from "express";

import {
  getDbUser,
  getDbUserProfile,
} from "@/services/repositories/userRepository";
import { isValidId } from "@/utils/mongoose";

/**
 * Get the user basic info
 *
 * @param req
 * @param res
 */
const getUserById = async (req: Request, res: Response) => {
  try {
    const userId = req.params["userId"];

    if (isValidId(userId)) {
      const user = await getDbUser(userId);

      res.status(200).json(user);
    } else {
      res.status(400).json({ error: "MongoDB: Invalid user id" });
      return;
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({ error: `MongoDB: User not found: ${error}` });
    return;
  }
};

/**
 * Get the user profile
 *
 * @param req
 * @param res
 */
const getUserProfileById = async (req: Request, res: Response) => {
  try {
    const userId = req.params["userId"];

    if (isValidId(userId)) {
      const userProfile = await getDbUserProfile(userId);

      res.status(200).json(userProfile);
    } else {
      res.status(400).json({ error: "MongoDB: Invalid user id" });
      return;
    }
  } catch (error) {
    console.log(error);
    res
      .status(400)
      .json({ error: `MongoDB: User profile not found: ${error}` });
    return;
  }
};

export { getUserById, getUserProfileById };
