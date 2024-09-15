import { Request, Response } from "express";

import { controllersErrorHandler } from "@/models/interfaces/common/error";
import { IUserGames } from "@/models/interfaces/user";
import {
  createDbGameIconBin,
  createDbGamesByUser,
  getDbGameIconBin,
  getDbGameIconBinByImgType,
  getDbGameIconBinByListOfGamesIds,
  getDbGamesListByUserId,
  getDbUserGameByIdAndPlatform,
  getDbUserGameByIdAndPlatformWithTrophies,
  updateDbGamesByUserId,
} from "@/services/repositories/gameRepository";
import { setPsnApiPollingInterval } from "@/utils/http";

/**
 * Get the user by id from DB
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
    // const userId = "66c74f86a34c6bfd144e5203";
    const npCommunicationId = req.params["npCommunicationId"];
    const trophyTitlePlatform = req.params["trophyTitlePlatform"];

    const game = await getDbUserGameByIdAndPlatform(
      userId,
      trophyTitlePlatform,
      npCommunicationId
    );

    console.log("returned game from DB");
    return res.json(game);
  } catch (error: unknown) {
    console.log(error);
    const resObj = controllersErrorHandler(error);
    return res.status(resObj.status).json(resObj);
  }
};

/**
 * Get the user by id from DB
 *
 * @param userId
 * @returns
 */
export const getUserGameByIdAndPlatformWithTrophies = async (
  req: Request,
  res: Response
) => {
  try {
    //Get user id from session
    const userId = req.session.user!.id;
    // const userId = "66c74f86a34c6bfd144e5203";
    const npCommunicationId = req.params["npCommunicationId"];
    const trophyTitlePlatform = req.params["trophyTitlePlatform"];

    const game = await getDbUserGameByIdAndPlatformWithTrophies(
      userId,
      trophyTitlePlatform,
      npCommunicationId
    );

    console.log("returned game with trophies from DB");
    return res.json(game);
  } catch (error: unknown) {
    console.log(error);
    const resObj = controllersErrorHandler(error);
    return res.status(resObj.status).json(resObj);
  }
};

/**
 * Get the list of games of a user
 *
 * @param req
 * @param res
 * @returns
 */
const getGamesByUser = async (req: Request, res: Response) => {
  try {
    //Get user id from session
    const userId = req.session.user!.id;
    // const userId = "66c74f86a34c6bfd144e5203";

    const gamesByUser = await getDbGamesListByUserId(userId);

    if (gamesByUser) {
      // Return updated games list from db
      await getUpdatedDbGamesList(req, res, gamesByUser, userId);
    } else {
      // Create games list into DB and return result
      const createdGames = await createDbGamesByUser(userId);

      if (createdGames) {
        // Download and create (if not exists yet) the game image (trophyTitleIconUrl)
        // and insert as binary data in the collection "gamesicons"
        await createDbGameIconBin(createdGames);

        console.log("created userGames on DB");
        return res.json(createdGames);
      }
    }
  } catch (error) {
    console.log(error);
    const resObj = controllersErrorHandler(error);
    return res.status(resObj.status).json(resObj);
  }
};

/**
 * Retrieve or updated list of from DB
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

  if (diffHours > pollingInterval) {
    const updatedGames = await updateDbGamesByUserId(userId);

    if (updatedGames) {
      // Download and update (if not exists yet) the game image (trophyTitleIconUrl)
      // and insert as binary data in the collection "gamesicons"
      await createDbGameIconBin(updatedGames);

      console.log("updated userGames on DB");
      return res.json(gamesByUser);
    }
  } else {
    console.log("returned userGames from DB");
    return res.json(gamesByUser);
  }
};

/**
 * Get the icon (image) binary data from a game id (npCommunicationId)
 *
 * @param req
 * @param res
 * @returns
 */
const getGameIconBin = async (req: Request, res: Response) => {
  try {
    const npCommunicationId = req.params["npCommunicationId"];

    const gameIconBin = await getDbGameIconBin(npCommunicationId);

    res.json(gameIconBin);
  } catch (error) {
    console.log(error);
    const resObj = controllersErrorHandler(error);
    return res.status(resObj.status).json(resObj);
  }
};

/**
 * Get the PNG or WEBP icon (image) binary data from a game id (npCommunicationId)
 *
 * @param req
 * @param res
 * @returns
 */
const getGameIconBinByImgType = async (req: Request, res: Response) => {
  try {
    const npCommunicationId = req.params["npCommunicationId"];
    const imgType = req.params["imgType"];

    const gameIconBin = await getDbGameIconBinByImgType(
      npCommunicationId,
      imgType
    );

    res.json(gameIconBin);
  } catch (error) {
    console.log(error);
    const resObj = controllersErrorHandler(error);
    return res.status(resObj.status).json(resObj);
  }
};

/**
 * Get the icon (image) binary data from a list of game ids (npCommunicationId)
 *
 * @param req
 * @param res
 */
const getGamesIconBinListByIds = async (req: Request, res: Response) => {
  try {
    const { npCommIdList, imgType } = req.body;
    const gameIconBin = await getDbGameIconBinByListOfGamesIds(
      npCommIdList,
      imgType
    );

    res.json(gameIconBin);
  } catch (error) {
    console.log(error);
    const resObj = controllersErrorHandler(error);
    return res.status(resObj.status).json(resObj);
  }
};

export {
  getGameIconBin,
  getGameIconBinByImgType,
  getGamesByUser,
  getGamesIconBinListByIds,
};
