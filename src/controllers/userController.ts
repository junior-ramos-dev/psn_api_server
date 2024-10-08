import { Request, Response } from "express";

import { controllersErrorHandler } from "@/models/interfaces/common/error";
import { IUserProfile } from "@/models/interfaces/user";
import {
  getDbUserById,
  getDbUserProfileByUserId,
  updateDbUserProfile,
} from "@/services/repositories/userRepository";
import { setPsnApiPollingInterval } from "@/utils/http";

/**
 * Get the user basic info
 *
 * @param req
 * @param res
 */
const getUserById = async (req: Request, res: Response) => {
  try {
    //Get user id from session
    const userId = req.session.user!.id;

    const user = await getDbUserById(userId);

    res.status(200).json(user);
  } catch (error) {
    console.log(error);
    const resObj = controllersErrorHandler(error);
    res.status(resObj.status).json(resObj);
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
    //Get user id from session
    const userId = req.session.user!.id;

    const userProfile = await getDbUserProfileByUserId(userId);

    if (userProfile) {
      // Get updated user profile from DB
      await getUpdatedDbUserProfile(req, res, userProfile);
    }
  } catch (error) {
    console.log(error);
    const resObj = controllersErrorHandler(error);
    res.status(resObj.status).json(resObj);
  }
};

/**
 * Get updated user profile from DB
 *
 * @param req
 * @param res
 * @param userProfile
 * @returns
 */
const getUpdatedDbUserProfile = async (
  req: Request,
  res: Response,
  userProfile: IUserProfile
) => {
  // Interval in hours to request data from psnApi;
  const { diffHours, pollingInterval } = setPsnApiPollingInterval(
    userProfile.updatedAt,
    2
  );

  if (diffHours > pollingInterval) {
    const updatedProfile = await updateDbUserProfile(
      userProfile.userId.toString(),
      userProfile.onlineId
    );

    if (updatedProfile) {
      console.log("updated userGames on DB");
      res.json(updatedProfile);
    }
  } else {
    console.log("returned userGames from DB");
    res.status(200).json(userProfile);
  }
};

export { getUserById, getUserProfileById };
