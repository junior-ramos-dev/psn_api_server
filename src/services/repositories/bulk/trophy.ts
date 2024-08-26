import _ from "lodash";
import { MongooseError } from "mongoose";

import { PSN_AUTH } from "@/controllers/authController";
import { IBulkResponse } from "@/models/interfaces/common";
import { IGamesTrophiesBulk } from "@/models/interfaces/game";
import { IUserGames } from "@/models/interfaces/user";
import { UserGamesTrophies } from "@/models/schemas/user";
import { getGameTrophiesInfo } from "@/services/psnApi/trophies";
import { setPsnApiPollingInterval } from "@/utils/http";

import { getDbGamesListByUserId } from "../gameRepository";
import { getOrCreateDbUserGamesTrophies } from "../trophyRepository";

/**
 * Get the params for insert trophies list bulk
 *
 * @param userGames
 * @param userId
 * @returns
 */
const getBulkTrophiesList = async (userId: string, userGames: IUserGames) => {
  const bulkTrohiesList = [];
  const gameTrophiesBulk: IGamesTrophiesBulk[] = [];

  const bulkTrophiesData = {
    totalGames: userGames.games.length,
    totalInsertDb: 0,
    gamesTrohiesList: new Array<string>(),
  };

  let count = 0;

  await Promise.all(
    userGames.games.map(async (game) => {
      const npCommunicationId = game.npCommunicationId;
      const trophyTitlePlatform = game.trophyTitlePlatform;
      const trophyTitleName = game.trophyTitleName.toUpperCase();

      // Get the credentials used by psn_api
      const { accessToken, accountId } = await PSN_AUTH.getCredentials();
      const psnApiTrophyList = await getGameTrophiesInfo(
        accessToken,
        accountId,
        npCommunicationId,
        trophyTitlePlatform
      );

      if (psnApiTrophyList) {
        gameTrophiesBulk.push({
          npCommunicationId: npCommunicationId,
          trophies: psnApiTrophyList,
        });
      } else {
        console.log(`psnApi trophy list not found: ${trophyTitleName}`);
      }
      const gameMsg = `[${npCommunicationId}] [${trophyTitlePlatform}] [${trophyTitleName}]`;
      bulkTrophiesData.gamesTrohiesList.push(gameMsg);

      count++;
      console.log(`${count}/${userGames.games.length} - ${gameMsg}`);
    })
  );

  bulkTrophiesData.totalInsertDb = count;

  bulkTrohiesList.push({
    updateOne: {
      filter: {
        userId: userId,
      },
      update: {
        gamesTrophies: gameTrophiesBulk,
        upsert: true,
        new: true,
      },
    },
  });

  return { bulkTrohiesList, bulkTrophiesData };
};

/**
 * Execute the trohpies list insert/update bulk
 *
 * @param userGames
 * @param userId
 * @returns
 */
const execUpsertBulkTrophiesList = async (
  userId: string,
  userGames: IUserGames,
  bulkResponse: IBulkResponse<string>
) => {
  const { bulkTrohiesList, bulkTrophiesData } = await getBulkTrophiesList(
    userId,
    userGames
  );

  await UserGamesTrophies.bulkWrite(bulkTrohiesList)
    .then((bulkWriteOpResult) => {
      bulkResponse.message =
        "BULK OK: Trophies Lists added/updated into DB with success";
      bulkResponse.data = bulkTrophiesData;

      console.log(
        "BULK OK: Trophies Lists added/updated into DB with success."
      );
      console.log(JSON.stringify(bulkWriteOpResult, null, 2));
    })
    .catch((err) => {
      bulkResponse.message =
        "BULK OK: Trophies Lists added/updated into DB with success";
      bulkResponse.data = err;
      bulkResponse.isError = true;

      console.log("BULK ERROR: Adding/updating trophies list into DB failed");
      console.log(JSON.stringify(err, null, 2));
    });

  return bulkResponse;
};

/**
 *
 * @param userId
 * @param insertBulkResponse
 * @returns
 */
const insertBulkTrophiesList = async (
  userId: string,
  userGames: IUserGames,
  insertBulkResponse: IBulkResponse<string>
) => {
  console.log(
    `[${new Date().toISOString()}] Started inserting trophies list bulk...`
  );

  insertBulkResponse = await execUpsertBulkTrophiesList(
    userId,
    userGames,
    insertBulkResponse
  );
  console.log(
    `[${new Date().toISOString()}] Finished inserting trophies list bulk.`
  );

  return insertBulkResponse;
};

/**
 *
 * @param userId
 * @param updateBulkResponse
 * @returns
 */
const updateBulkTrophiesList = async (
  userId: string,
  userGames: IUserGames,
  updateBulkResponse: IBulkResponse<string>
) => {
  console.log(
    `[${new Date().toISOString()}] Started updating trophies list bulk...`
  );

  updateBulkResponse = await execUpsertBulkTrophiesList(
    userId,
    userGames,
    updateBulkResponse
  );

  console.log(
    `[${new Date().toISOString()}] Finished updating trophies list bulk.`
  );

  return updateBulkResponse;
};

/**
 * Insert or Update the list of trophies for all games from a user (bulk).
 *
 * @param userId
 * @param bulkResponse
 * @returns
 */
export const upsertTrophiesForAllGamesBulk = async (
  userId: string,
  bulkResponse: IBulkResponse<string>
) => {
  try {
    const userGames = await getDbGamesListByUserId(userId);

    if (userGames && !(userGames instanceof MongooseError)) {
      const userGamesTrophies = await getOrCreateDbUserGamesTrophies(userId);

      if (userGamesTrophies && !(userGamesTrophies instanceof MongooseError)) {
        // Interval in hours to request data from psnApi;
        const { diffHours, pollingInterval } = setPsnApiPollingInterval(
          userGames.updatedAt,
          2
        );

        const gamesTrohpies = userGamesTrophies.gamesTrophies;

        if (gamesTrohpies.length && diffHours > pollingInterval) {
          // Update Bulk Trophies List
          bulkResponse = await updateBulkTrophiesList(
            userId,
            userGames,
            bulkResponse
          );
        } else if (!gamesTrohpies.length) {
          // Insert Bulk Trophies List
          bulkResponse = await insertBulkTrophiesList(
            userId,
            userGames,
            bulkResponse
          );
        } else {
          const nextUpdate = _.round((pollingInterval - diffHours) * 60);

          bulkResponse.message = `Trophies lists are updated. Next update in ${nextUpdate} Mins`;
        }
      }
    }

    return bulkResponse;
  } catch (error) {
    console.log(error);
    return new MongooseError(`${error}`);
  }
};
