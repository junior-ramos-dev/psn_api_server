import { Request, Response } from "express";
import { validationResult } from "express-validator";
import { MongooseError } from "mongoose";

import {
  createDbGameIconBin,
  createDbGamesByUser,
  getDbGameIconBin,
  getDbGameIconBinByListOfGamesIds,
  getDbGamesByUserId,
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
      const gamesByUser = await getDbGamesByUserId(userId);

      if (gamesByUser && !(gamesByUser instanceof MongooseError)) {
        // Interval in hours to request data from psnApi;
        //TODO Set the diff to 2 hours for prod
        const { diffHours, psnApiPollingInterval } = setPsnApiPollingInterval(
          gamesByUser.updatedAt,
          1000
        );

        const isFreshEtag = isFreshEtagHeader(req, res, gamesByUser);
        console.log("isFreshEtag: ", isFreshEtag);

        if (isFreshEtag && diffHours > psnApiPollingInterval) {
          const updatedGames = await updateDbGamesByUser(userId);

          if (updatedGames && !(updatedGames instanceof MongooseError)) {
            // Download and update (if not exists yet) the game image (trophyTitleIconUrl)
            // and insert as binary data in the collection "gamesicons"
            await createDbGameIconBin(updatedGames);

            console.log("updated userGames on DB");
            res.json(gamesByUser);
          }
        } else if (isFreshEtag && diffHours < psnApiPollingInterval) {
          console.log(
            "Not Modified. You can continue using the same cached version of user games list."
          );
          res.status(304).send();
        } else if (!isFreshEtag) {
          console.log("returned userGames from DB");
          res.json(gamesByUser);
        }
      } else {
        //TODO Retrieve games from psn_api and persit into DB on register
        const createdGames = await createDbGamesByUser(userId);

        if (createdGames && !(createdGames instanceof MongooseError)) {
          // Download and create (if not exists yet) the game image (trophyTitleIconUrl)
          // and insert as binary data in the collection "gamesicons"
          await createDbGameIconBin(createdGames);

          console.log("created userGames on DB");
          res.json(createdGames);
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
      .json({ error: `MongoDB: Error getting games by user: ${error}` });
    return;
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
