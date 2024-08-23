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
  // Validate Request Headers
  // Find and validate the request properties
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    res.status(422).json({ errors: errors.array() });
    return;
  }

  try {
    const userId = req.params["userId"];

    if (isValidId(userId)) {
      const userProfile = await getDbUserProfile(userId);

      if (userProfile && !(userProfile instanceof MongooseError)) {
        // Interval in hours to request data from psnApi;
        //TODO Set the diff to 2 hours for prod
        const { diffHours, psnApiPollingInterval } = setPsnApiPollingInterval(
          userProfile.updatedAt,
          1000
        );

        const isFreshEtag = isFreshEtagHeader(req, res, userProfile);
        console.log("isFreshEtag: ", isFreshEtag);

        if (isFreshEtag && diffHours > psnApiPollingInterval) {
          const updatedProfile = await updateDbUserProfile(
            userId,
            userProfile.onlineId
          );

          if (updatedProfile && !(updatedProfile instanceof MongooseError)) {
            console.log("updated userGames on DB");
            res.json(updatedProfile);
          }
        } else if (isFreshEtag && diffHours < psnApiPollingInterval) {
          console.log(
            "Not Modified. You can continue using the same cached version of user profile."
          );
          res.status(304).send();
        } else if (!isFreshEtag) {
          console.log("returned userGames from DB");
          res.status(200).json(userProfile);
        }
      }
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
