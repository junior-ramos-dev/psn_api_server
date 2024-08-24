import { Request, Response } from "express";
import { validationResult } from "express-validator";
import { MongooseError } from "mongoose";

import {
  getDbUser,
  getDbUserProfile,
  updateDbUserProfile,
} from "@/services/repositories/userRepository";
import { isFreshEtagHeader, setPsnApiPollingInterval } from "@/utils/http";
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
    return res.status(400).json({ error: `MongoDB: User not found: ${error}` });
  }
};

/**
 * Get the user profile
 *
 * @param req
 * @param res
 */
const getUserProfileById = async (req: Request, res: Response) => {
  // Validate Request Headers
  // Find and validate the request properties
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  try {
    const userId = req.params["userId"];

    if (isValidId(userId)) {
      const userProfile = await getDbUserProfile(userId);

      if (userProfile && !(userProfile instanceof MongooseError)) {
        // Interval in hours to request data from psnApi;
        const { diffHours, pollingInterval } = setPsnApiPollingInterval(
          userProfile.updatedAt,
          2
        );

        const isFreshEtag = isFreshEtagHeader(req, res, userProfile);
        console.log("isFreshEtag: ", isFreshEtag);

        if (isFreshEtag && diffHours > pollingInterval) {
          const updatedProfile = await updateDbUserProfile(
            userId,
            userProfile.onlineId
          );

          if (updatedProfile && !(updatedProfile instanceof MongooseError)) {
            console.log("updated userGames on DB");
            return res.json(updatedProfile);
          }
        } else if (isFreshEtag && diffHours < pollingInterval) {
          console.log(
            "Not Modified. You can continue using the same cached version of user profile."
          );
          return res.status(304).send();
        } else if (!isFreshEtag) {
          console.log("returned userGames from DB");
          return res.status(200).json(userProfile);
        }
      }
    } else {
      return res.status(400).json({ error: "MongoDB: Invalid user id" });
    }
  } catch (error) {
    console.log(error);
    return res
      .status(400)
      .json({ error: `MongoDB: User profile not found: ${error}` });
  }
};

export { getUserById, getUserProfileById };
