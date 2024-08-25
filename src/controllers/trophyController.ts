import { Request, Response } from "express";
import _ from "lodash";
import { MongooseError } from "mongoose";

import { UserGames } from "@/models/schemas/user";
import { getDbUserGame } from "@/services/repositories/gameRepository";
import {
  createDbTrophyListByGame,
  execUpsertBulkTrophiesList,
  getDbTrophyListByGame,
  getOrCreateDbUserGamesTrophies,
  updateDbUserGamesTrophies,
} from "@/services/repositories/trophyRepository";
import { setPsnApiPollingInterval } from "@/utils/http";
import { isValidId } from "@/utils/mongoose";

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

    if (isValidId(userId)) {
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
          const userGamesTrophies = await getOrCreateDbUserGamesTrophies(
            userId
          );

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
    } else {
      return res.status(400).json({ error: "MongoDB: Invalid user id" });
    }
  } catch (error) {
    console.log(error);
  }
};

/**
 * Insert or Update the list of trophies for all games from a user (bulk).
 *
 * @param req
 * @param res
 */
const upsertTrophiesForAllGamesBulk = async (req: Request, res: Response) => {
  try {
    const userId = req.params["userId"];

    if (isValidId(userId)) {
      const userGamesTrophies = await getOrCreateDbUserGamesTrophies(userId);

      if (userGamesTrophies && !(userGamesTrophies instanceof MongooseError)) {
        // Interval in hours to request data from psnApi;
        const { diffHours, pollingInterval } = setPsnApiPollingInterval(
          userGamesTrophies.updatedAt,
          2
        );

        const userGames = await UserGames.findOne({
          userId: userId,
        }).select({
          userId: 1,
          "games.npCommunicationId": 1,
          "games.trophyTitlePlatform": 1,
          "games.trophyTitleName": 1,
        });

        if (userGames) {
          const gamesTrohpies = userGamesTrophies.gamesTrophies;

          if (gamesTrohpies.length && diffHours > pollingInterval) {
            console.log(
              `[${new Date().toISOString()}] Started updating trophies list bulk...`
            );

            const bulkResponse = await execUpsertBulkTrophiesList(
              userGames,
              userId
            );

            console.log(
              `[${new Date().toISOString()}] Finished updating trophies list bulk.`
            );

            if (!bulkResponse.isError) {
              return res.status(200).send(bulkResponse);
            } else {
              return res.status(400).send(bulkResponse);
            }
          } else if (!gamesTrohpies.length) {
            console.log(
              `[${new Date().toISOString()}] Started inserting trophies list bulk...`
            );

            const bulkResponse = await execUpsertBulkTrophiesList(
              userGames,
              userId
            );
            console.log(
              `[${new Date().toISOString()}] Finished inserting trophies list bulk.`
            );

            if (!bulkResponse.isError) {
              return res.status(200).send(bulkResponse);
            } else {
              return res.status(400).send(bulkResponse);
            }
          } else {
            const nextUpdate = _.round((pollingInterval - diffHours) * 60);

            res.status(200).send({
              message: `Trophies lists are updated. Next update in ${nextUpdate} Mins`,
            });
          }
        } else {
          console.log("MongoDB: Collection userGames not found.");
          return res
            .status(400)
            .json({ error: "MongoDB: Collection userGames not found." });
        }
      } else {
        return res
          .status(400)
          .json({ error: "MongoDB: Collection userGamesTrophies not found" });
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

export { getTrophiesByGame, upsertTrophiesForAllGamesBulk };
