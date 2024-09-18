import { Request, Response } from "express";
import { MongooseError } from "mongoose";

import { IBulkResponse } from "@/models/interfaces/common/bulk";
import { controllersErrorHandler } from "@/models/interfaces/common/error";
import { IUserSingleGame } from "@/models/interfaces/user/user";
import { upsertTrophiesForAllGamesBulk } from "@/services/repositories/bulk/trophy";
import { getDbUserGameByIdAndPlatform } from "@/services/repositories/gameRepository";
import {
  createDbTrophyListByGame,
  getDbTrophyListByGame,
  getOrCreateDbUserGamesTrophies,
  updateDbUserGamesTrophies,
} from "@/services/repositories/trophyRepository";
import { setPsnApiPollingInterval } from "@/utils/http";

/**
 * Get trophy list by Game ID and Game Platform
 *
 * @param req
 * @param res
 * @returns
 */
const getAllTrophiesByGame = async (req: Request, res: Response) => {
  try {
    //Get user id from session
    const userId = req.session.user!.id;
    // const userId = "66c74f86a34c6bfd144e5203";
    const npCommunicationId = req.params["npCommunicationId"];
    const trophyTitlePlatform = req.params["trophyTitlePlatform"];

    const userGame = await getDbUserGameByIdAndPlatform(
      userId,
      npCommunicationId,
      trophyTitlePlatform
    );

    if (userGame) {
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
  } catch (error) {
    console.log(error);
    const resObj = controllersErrorHandler(error);
    return res.status(resObj.status).json(resObj);
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
  userGame: IUserSingleGame
) => {
  const userId = userGame.userId.toString();
  const npCommunicationId = userGame.game.npCommunicationId;
  const trophyTitlePlatform = userGame.game.trophyTitlePlatform;

  const gameTrophies = await getDbTrophyListByGame(
    userId,
    trophyTitlePlatform,
    npCommunicationId
  );

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
    //Get user id from session
    const userId = req.session.user!.id;
    // const userId = "66c74f86a34c6bfd144e5203";
    const bulkResponse: IBulkResponse<string> = {
      name: "createTrophiesListForAllGamesBulk",
      message: "",
      data: {},
      isError: false,
    };

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
  } catch (error) {
    console.log(error);
    const resObj = controllersErrorHandler(error);
    return res.status(resObj.status).json(resObj);
  }
};

export { createTrophiesListForAllGamesBulk, getAllTrophiesByGame };
