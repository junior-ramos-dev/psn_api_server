import { Request, Response } from "express";

import { UserGames, UserGamesTrophies } from "@/models/schemas/user";
import { getDbUserGame } from "@/services/repositories/gameRepository";
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
const getTrophiesByGame = async (req: Request, res: Response) => {
  try {
    const userId = req.params["userId"];
    const npCommunicationId = req.params["npCommunicationId"];
    const trophyTitlePlatform = req.params["trophyTitlePlatform"];
    // const user = await User.findById(userId);

    const userGame = await getDbUserGame(userId, npCommunicationId);

    if (userGame) {
      const gameTrophies = await getDbTrophyListByGame(
        userId,
        npCommunicationId
      );

      if (gameTrophies) {
        // Interval in hours to request data from psnApi;
        const { diffHours, pollingInterval } = setPsnApiPollingInterval(
          gameTrophies.updatedAt,
          2
        );

        if (diffHours > pollingInterval) {
          const updatedGameTrophies = await updateDbUserGamesTrophies(
            userId,
            npCommunicationId,
            trophyTitlePlatform
          );

          // Download and update (if not exists yet) the trophy image (trophyIconUrl)
          // and insert as binary data in the collection "trophiesicons"
          //TODO Update to create trophies icons
          // await createDbGameIconBin(trophiesByGame);

          console.log("updated trophy list by game on DB");
          return res.json(updatedGameTrophies);
        } else if (diffHours < pollingInterval) {
          console.log("returned trophy list by game from DB");
          return res.json(gameTrophies);
        }
      } else {
        const userGamesTrophies = await getOrCreateDbUserGamesTrophies(userId);

        if (userGamesTrophies) {
          const createdTrophyListByGame = await createDbTrophyListByGame(
            userId,
            npCommunicationId,
            trophyTitlePlatform
          );

          // Download and create (if not exists yet) the trophy image (trophyIconUrl)
          // and insert as binary data in the collection "trophiesicons"
          //TODO Update to create trophies icons
          // await createDbGameIconBin(trophiesByGame);

          console.log("created trophy list by game on DB");
          return res.json(createdTrophyListByGame);
        }
      }
    } else {
      return res
        .status(400)
        .json({ message: "Unable to get trophy list. Game not found." });
    }
  } catch (error) {
    console.log(error);
  }
};

/**
 * Get the list of trophies info for all games from a user (batch).
 *
 * @param req
 * @param res
 */
const createOrUpdateAllGamesTrophiesBatch = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = req.params["userId"];
    // const user = await User.findById(userId);

    const trophiesListParams = await UserGames.findOne({
      userId: userId,
    }).select({
      userId: 1,
      "games.npCommunicationId": 1,
      "games.trophyTitlePlatform": 1,
    });
    // res.send(trohiesListParams);

    trophiesListParams?.games.forEach(async (params) => {
      const gameTrophiesExists = await UserGamesTrophies.findOne({
        userId: userId,
        npCommunicationId: params.npCommunicationId,
      }).lean();

      if (gameTrophiesExists) {
        // Interval in hours to request data from psnApi;
        const { diffHours, pollingInterval } = setPsnApiPollingInterval(
          gameTrophies.updatedAt,
          2
        );

        if (diffHours > pollingInterval) {
          await updateDbUserGamesTrophies(
            userId,
            params.npCommunicationId,
            params.trophyTitlePlatform
          );

          console.log(`Updated ${params.npCommunicationId} gameTrophies on DB`);
        }
      } else {
        //TODO Fixme
        // await getOrCreateDbUserGamesTrophies(
        //   userId,
        //   params.npCommunicationId,
        //   params.trophyTitlePlatform
        // );

        console.log(`Created ${params.npCommunicationId} gameTrophies on DB`);
      }
    });

    return res.status(200).send("Trophies Lists created/upadted with success.");
  } catch (error) {
    console.log(error);
  }
};

export { createOrUpdateAllGamesTrophiesBatch, getTrophiesByGame };
