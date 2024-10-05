import express, { Request, Response } from "express";

import { controllersErrorHandler } from "@/models/interfaces/common/error";
import { IUserGames } from "@/models/interfaces/user";
import {
  insertAllDbGamesByUser,
  updateAllDbGamesByUserId,
} from "@/services/repositories/bulk/game";
import { createDbGameIconBin } from "@/services/repositories/gameIconRepository";
import {
  getDbGamesListByUserId,
  getDbUserGameByIdAndPlatform,
  getDbUserGameDetails,
  getDbUserGameDetailsList,
} from "@/services/repositories/gameRepository";
import { setPsnApiPollingInterval } from "@/utils/http";

/**
 * Get game by id (npCommunicationId) and platform (trophyTitlePlatform) from DB
 *
 * @param userId
 * @returns
 */
export const getUserGameByIdAndPlatform = async (
  req: Request,
  res: Response
) => {
  try {
    //Get user id from session
    const userId = req.session.user!.id;
    const npCommunicationId = req.params["npCommunicationId"];
    const trophyTitlePlatform = req.params["trophyTitlePlatform"];

    const game = await getDbUserGameByIdAndPlatform(
      userId,
      npCommunicationId,
      trophyTitlePlatform
    );

    console.log("returned game from DB");
    res.json(game);
  } catch (error: unknown) {
    console.log(error);
    const resObj = controllersErrorHandler(error);
    res.status(resObj.status).json(resObj);
  }
};

/**
 * Get game details by id (npCommunicationId) and platform (trophyTitlePlatform) from DB
 *
 * @param userId
 * @returns
 */
export const getUserGameDetails = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    //Get user id from session
    const userId = req.session.user!.id;

    // URL params
    const npCommunicationId = req.params["npCommunicationId"];
    const trophyTitlePlatform = req.params["trophyTitlePlatform"];
    //Query params
    const imgType = String(req.query.imgType);
    const getTrophies = Number(req.query.getTrophies);

    const game = await getDbUserGameDetails(
      userId,
      trophyTitlePlatform,
      npCommunicationId,
      imgType,
      getTrophies
    );

    console.log("returned game with trophies from DB");
    res.json(game);
  } catch (error: unknown) {
    console.log(error);
    const resObj = controllersErrorHandler(error);
    res.status(resObj.status).json(resObj);
  }
};

/**
 * Get game details by id (npCommunicationId) and platform (trophyTitlePlatform) from DB
 *
 * @param userId
 * @returns
 */
export const getUserGameDetailsList = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    //Get user id from session
    const userId = req.session.user!.id;

    //Query params
    const limit = Number(req.query.limit);
    const offset = Number(req.query.offset);
    const imgType = String(req.query.imgType);
    const getTrophies = Number(req.query.getTrophies);

    const game = await getDbUserGameDetailsList(
      userId,
      limit,
      offset,
      imgType,
      getTrophies
    );

    console.log("returned game with trophies from DB");
    res.json(game);
  } catch (error: unknown) {
    console.log(error);
    const resObj = controllersErrorHandler(error);
    res.status(resObj.status).json(resObj);
  }
};

/**
 * Upsert the list of all games from a user
 *
 * @param req
 * @param res
 * @returns
 */
export const upsertAllGamesByUser = async (req: Request, res: Response) => {
  try {
    //Get user id from session
    const userId = req.session.user!.id;

    const gamesByUser = await getDbGamesListByUserId(userId);

    if (gamesByUser) {
      // Return updated games list from db
      await updateAllGamesList(req, res, gamesByUser, userId);
    } else {
      // Create games list into DB and return result
      const createdGames = await insertAllDbGamesByUser(userId);

      if (createdGames) {
        // Download and create (if not exists yet) the game image (trophyTitleIconUrl)
        // and insert as binary data in the collection "gamesicons"
        await createDbGameIconBin(userId);

        console.log("created userGames on DB");
        res.json(createdGames);
      }
    }
  } catch (error) {
    console.log(error);
    const resObj = controllersErrorHandler(error);
    res.status(resObj.status).json(resObj);
  }
};

/**
 * Retrieve the updated list of all games from DB/PSN_API
 *
 * @param req
 * @param res
 * @param gamesByUser
 * @param userId
 * @returns
 */
const updateAllGamesList = async (
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

  if (diffHours > pollingInterval) {
    const updatedGames = await updateAllDbGamesByUserId(userId);

    if (updatedGames) {
      // Download and update (if not exists yet) the game image (trophyTitleIconUrl)
      // and insert as binary data in the collection "gamesicons"
      await createDbGameIconBin(userId);

      console.log("updated userGames on DB");
      res.json(gamesByUser);
    }
  } else {
    console.log("returned userGames from DB");
    res.json(gamesByUser);
  }
};
