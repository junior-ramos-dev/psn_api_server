import { Request, Response } from "express";
import { validationResult } from "express-validator";
import { MongooseError } from "mongoose";

import { IUserGames } from "@/models/interfaces/user";
import {
  createDbGameIconBin,
  createDbGamesByUser,
  getDbGameIconBin,
  getDbGameIconBinByListOfGamesIds,
  getDbGamesListByUserId,
  updateDbGamesByUser,
} from "@/services/repositories/gameRepository";
import { isFreshEtagHeader, setPsnApiPollingInterval } from "@/utils/http";
import { isValidId } from "@/utils/mongoose";

/**
 *
 * @param req
 * @param res
 * @returns
 */
const getGamesByUser = async (req: Request, res: Response) => {
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
      const gamesByUser = await getDbGamesListByUserId(userId);

      if (gamesByUser && !(gamesByUser instanceof MongooseError)) {
        // Return updated games list from db
        await getUpdatedDbGamesList(req, res, gamesByUser, userId);
      } else {
        // Create games list into DB and return result
        //TODO Retrieve games from psn_api and persit into DB on register
        const createdGames = await createDbGamesByUser(userId);

        if (createdGames && !(createdGames instanceof MongooseError)) {
          // Download and create (if not exists yet) the game image (trophyTitleIconUrl)
          // and insert as binary data in the collection "gamesicons"
          await createDbGameIconBin(createdGames);

          console.log("created userGames on DB");
          return res.json(createdGames);
        }
      }
    } else {
      return res.status(400).json({ error: "MongoDB: Invalid user id" });
    }
  } catch (error) {
    console.log(error);
    return res
      .status(400)
      .json({ error: `MongoDB: Error getting games by user: ${error}` });
  }
};

/**
 * Get updated games list from DB
 *
 * @param req
 * @param res
 * @param gamesByUser
 * @param userId
 * @returns
 */
const getUpdatedDbGamesList = async (
  req: Request,
  res: Response,
  gamesByUser: IUserGames,
  userId: string
) => {
  // Interval in hours to request data from psnApi;
  const { diffHours, pollingInterval } = setPsnApiPollingInterval(
    gamesByUser.updatedAt,
    2
  );

  const isFreshEtag = isFreshEtagHeader(req, res, gamesByUser);
  console.log("isFreshEtag: ", isFreshEtag);

  if (isFreshEtag && diffHours > pollingInterval) {
    const updatedGames = await updateDbGamesByUser(userId);

    if (updatedGames && !(updatedGames instanceof MongooseError)) {
      // Download and update (if not exists yet) the game image (trophyTitleIconUrl)
      // and insert as binary data in the collection "gamesicons"
      await createDbGameIconBin(updatedGames);

      console.log("updated userGames on DB");
      return res.json(gamesByUser);
    }
  } else if (isFreshEtag && diffHours < pollingInterval) {
    console.log(
      "Not Modified. You can continue using the same cached version of user games list."
    );
    res.status(304).send();
  } else if (!isFreshEtag) {
    console.log("returned userGames from DB");
    return res.json(gamesByUser);
  }
};

/**
 *
 */
const getGameIconBinByGame = async (req: Request, res: Response) => {
  try {
    const npCommunicationId = req.params["npCommunicationId"];

    const gameIconBin = await getDbGameIconBin(npCommunicationId);

    res.json(gameIconBin);
  } catch (error) {
    console.log(error);
  }
};

/**
 *
 */
const getGameIconBinByListOfGamesIds = async (req: Request, res: Response) => {
  try {
    const { npCommIdList } = req.body;
    const gameIconBin = await getDbGameIconBinByListOfGamesIds(npCommIdList);

    res.json(gameIconBin);
  } catch (error) {
    console.log(error);
  }
};

export { getGameIconBinByGame, getGameIconBinByListOfGamesIds, getGamesByUser };
