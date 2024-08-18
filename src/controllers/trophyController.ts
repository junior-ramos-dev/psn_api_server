import { Request, Response } from "express";

import { GameTrophies } from "@/models/schemas/game";
import { User, UserGames } from "@/models/schemas/user";
import {
  createDbTrophiesByGame,
  getDbTrophiesByGame,
  updateDbTrophiesByGame,
} from "@/services/repositories/trophyRepository";

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
    const user = await User.findById(userId);

    const gameTrophiesExists = await GameTrophies.findOne({
      userId: user!._id,
      npCommunicationId: npCommunicationId,
    }).lean();

    let trophiesByGame;

    if (gameTrophiesExists) {
      trophiesByGame = await getDbTrophiesByGame(user!._id, npCommunicationId);

      // Interval in hours to request data from psnApi;
      //TODO Set the diff to 2 hours for prod
      const psnApiPollingInterval = 1000; //hours
      const currentDate = new Date();
      const updatedAt = gameTrophiesExists.updatedAt;

      // Check the "updatedAt" from GameTrophies schema to retrieve new data from psnApi after 2 hours
      const diffHours =
        Math.abs(currentDate.getTime() - updatedAt.getTime()) / 3600000;

      console.log(currentDate, updatedAt);
      console.log(diffHours);

      if (diffHours > psnApiPollingInterval) {
        trophiesByGame = await updateDbTrophiesByGame(
          user!._id,
          npCommunicationId,
          trophyTitlePlatform
        );

        // Download and update (if not exists yet) the trophy image (trophyIconUrl)
        // and insert as binary data in the collection "trophiesicons"
        //TODO Update to create trophies icons
        // await createDbGameIconBin(trophiesByGame);

        console.log("updated gameTrophies on DB");
        res.json(trophiesByGame);
      } else if (diffHours < psnApiPollingInterval) {
        console.log("returned gameTrophies from DB");
        res.json(trophiesByGame);
      }
    } else {
      trophiesByGame = await createDbTrophiesByGame(
        user!._id,
        npCommunicationId,
        trophyTitlePlatform
      );
      console.log("created gameTrophies on DB");

      // Download and create (if not exists yet) the trophy image (trophyIconUrl)
      // and insert as binary data in the collection "trophiesicons"
      //TODO Update to create trophies icons
      // await createDbGameIconBin(trophiesByGame);

      res.json(trophiesByGame);
    }
  } catch (error) {
    console.log(error);
  }
};

//TODO Get the list of trophies info for all games from a user (bulk).
const createOrUpdateAllGamesTrophiesBulk = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = req.params["userId"];
    const user = await User.findById(userId);

    const trophiesListParams = await UserGames.findOne({
      userId: user!._id,
    }).select({
      userId: 1,
      "games.npCommunicationId": 1,
      "games.trophyTitlePlatform": 1,
    });
    // res.send(trohiesListParams);

    trophiesListParams?.games.forEach(async (params) => {
      const gameTrophiesExists = await GameTrophies.findOne({
        userId: user!._id,
        npCommunicationId: params.npCommunicationId,
      }).lean();

      if (gameTrophiesExists) {
        // Interval in hours to request data from psnApi;
        //TODO Set the diff to 2 hours for prod
        const psnApiPollingInterval = 1000; //hours
        const currentDate = new Date();
        const updatedAt = gameTrophiesExists.updatedAt;

        // Check the "updatedAt" from GameTrophies schema to retrieve new data from psnApi after 2 hours
        const diffHours =
          Math.abs(currentDate.getTime() - updatedAt.getTime()) / 3600000;

        console.log(currentDate, updatedAt);
        console.log(diffHours);

        if (diffHours > psnApiPollingInterval) {
          await updateDbTrophiesByGame(
            user!._id,
            params.npCommunicationId,
            params.trophyTitlePlatform
          );

          console.log(`Updated ${params.npCommunicationId} gameTrophies on DB`);
        }
      } else {
        await createDbTrophiesByGame(
          user!._id,
          params.npCommunicationId,
          params.trophyTitlePlatform
        );

        console.log(`Created ${params.npCommunicationId} gameTrophies on DB`);
      }
    });

    res.status(200).send("Trophies Lists created/upadted with success.");
  } catch (error) {
    console.log(error);
  }
};

export { createOrUpdateAllGamesTrophiesBulk, getTrophiesByGame };
