import { Request, Response } from "express";
import { MongooseError } from "mongoose";

import { IBulkResponse } from "@/models/interfaces/common/bulk";
import { IUserGames } from "@/models/interfaces/user";
import { upsertTrophiesForAllGamesBulk } from "@/services/repositories/bulk/trophy";
import { getDbUseGameByNpCommunicationId } from "@/services/repositories/gameRepository";
import {
  createDbTrophyListByGame,
  getDbTrophyListByGame,
  getOrCreateDbUserGamesTrophies,
  updateDbUserGamesTrophies,
} from "@/services/repositories/trophyRepository";
import { setPsnApiPollingInterval } from "@/utils/http";
import { isValidId } from "@/utils/mongoose";

//TODO Check if needs to create trophies icons
// const createDbTrophyIconBin = (trophiesByGame) => {};

//TODO Error handling / return response

/**
 * Get trophy list by Game ID and Game Platform
 *
 * @param req
 * @param res
 * @returns
 */
const getTrophiesByGame = async (req: Request, res: Response) => {
  try {
    const userId = req.params["userId"];
    const npCommunicationId = req.params["npCommunicationId"];
    const trophyTitlePlatform = req.params["trophyTitlePlatform"];

    if (isValidId(userId)) {
      const userGame = await getDbUseGameByNpCommunicationId(
        userId,
        npCommunicationId
      );

      if (userGame && !(userGame instanceof MongooseError)) {
        // Return updated trophies list from db
        await getUpdatedDbTrophyList(req, res, userGame);
      } else {
        // Create trophies list into DB and return result
        const userGamesTrophies = await getOrCreateDbUserGamesTrophies(userId);

        if (userGamesTrophies) {
          const createdTrophyListByGame = await createDbTrophyListByGame(
            userId,
            npCommunicationId,
            trophyTitlePlatform
          );

          console.log("created trophy list by game on DB");
          return res.json(createdTrophyListByGame);
        }
      }
    } else {
      return res.status(400).json({ error: "MongoDB: Invalid user id" });
    }
  } catch (error) {
    console.log(error);
  }
};

/**
 * Get updated trophies list from db
 *
 * @param req
 * @param res
 * @param userGame
 * @returns
 */
const getUpdatedDbTrophyList = async (
  req: Request,
  res: Response,
  userGame: IUserGames
) => {
  const userId = userGame.userId.toString();
  const npCommunicationId = userGame.games[0].npCommunicationId;
  const trophyTitlePlatform = userGame.games[0].trophyTitlePlatform;

  const gameTrophies = await getDbTrophyListByGame(userId, npCommunicationId);

  if (gameTrophies) {
    // Interval in hours to request data from psnApi;
    const { diffHours, pollingInterval } = setPsnApiPollingInterval(
      userGame.updatedAt,
      2
    );

    if (diffHours > pollingInterval) {
      const updatedGameTrophies = await updateDbUserGamesTrophies(
        userId,
        npCommunicationId,
        trophyTitlePlatform
      );

      console.log("updated trophy list by game on DB");
      return res.json(updatedGameTrophies);
    } else if (diffHours < pollingInterval) {
      console.log("returned trophy list by game from DB");
      return res.json(gameTrophies);
    }
  } else {
    return res
      .status(400)
      .json({ message: "Unable to get trophy list. Game not found." });
  }
};
/**
 * Insert or Update the list of trophies for all games from a user (bulk).
 *
 * @param req
 * @param res
 */
const createTrophiesListForAllGamesBulk = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = req.params["userId"];

    const bulkResponse: IBulkResponse<string> = {
      name: "createTrophiesListForAllGamesBulk",
      message: "",
      data: {},
      isError: false,
    };

    if (isValidId(userId)) {
      const upsertTrophiesResponse = await upsertTrophiesForAllGamesBulk(
        userId,
        bulkResponse
      );

      if (
        upsertTrophiesResponse &&
        !(upsertTrophiesResponse instanceof MongooseError)
      ) {
        if (!upsertTrophiesResponse.isError) {
          return res.status(200).send(bulkResponse);
        } else {
          return res.status(400).send(bulkResponse);
        }
      }
    } else {
      return res.status(400).json({ error: "MongoDB: Invalid user id" });
    }
  } catch (error) {
    console.log(`MongoDB: Error running games trohies list bulk: ${error}`);
    return res.status(400).json({
      error: `MongoDB: Error running games trohies list bulk: ${error}`,
    });
  }
};

export { createTrophiesListForAllGamesBulk, getTrophiesByGame };
