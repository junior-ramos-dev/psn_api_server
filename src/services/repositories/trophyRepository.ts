import { MongooseError, Types } from "mongoose";

import { PSN_AUTH } from "@/controllers/authController";
import { ITrophy } from "@/models/interfaces/trophy";
import { IUserGames, IUserGamesTrophies } from "@/models/interfaces/user/user";
import { GameTrophies } from "@/models/schemas/game";
import { UserGamesTrophies } from "@/models/schemas/user/user";
import { getGameTrophiesInfo } from "@/services/psnApi/trophies";

/**
 * Create the list of trophies by game
 *
 * @param userId
 * @param npCommunicationId
 * @param trophyTitlePlatform
 * @returns
 */
export const getOrCreateDbUserGamesTrophies = async (userId: string) => {
  try {
    const userGamesTrophies = await UserGamesTrophies.findOne({
      userId: userId,
    });

    if (userGamesTrophies) {
      return userGamesTrophies as IUserGamesTrophies;
    } else {
      const createdUserGamesTrophies = await UserGamesTrophies.create({
        userId: userId,
        gamesTrophies: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      return createdUserGamesTrophies as IUserGamesTrophies;
    }
  } catch (error: unknown) {
    if (error instanceof MongooseError) {
      console.log(error);
      return error;
    }
  }
};

/**
 * Create the list of trophies by game
 *
 * @param userId
 * @param npCommunicationId
 * @param trophyTitlePlatform
 * @returns
 */
export const createDbTrophyListByGame = async (
  userId: string,
  npCommunicationId: string,
  trophyTitlePlatform: string
) => {
  try {
    // Get the credentials used by psn_api
    const { accessToken, accountId } = await PSN_AUTH.getCredentials();
    const psnApiTrophyList = await getGameTrophiesInfo(
      accessToken,
      accountId,
      npCommunicationId,
      trophyTitlePlatform
    );

    const gameTrophyList = new GameTrophies({
      npCommunicationId: npCommunicationId,
      trophies: psnApiTrophyList,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const query = {
      userId: userId,
      "gamesTrophies.npCommunicationId": { $ne: npCommunicationId },
    };

    const update = { $push: { gamesTrophies: gameTrophyList } };

    await UserGamesTrophies.findOneAndUpdate(query, update);

    return gameTrophyList;
  } catch (error: unknown) {
    if (error instanceof MongooseError) {
      console.log(error);
      return error;
    }
  }
};

/**
 * Update the list of trophies by game
 *
 * @param userId
 * @param npCommunicationId
 * @param trophyTitlePlatform
 * @returns
 */
export const updateDbUserGamesTrophies = async (
  userId: string,
  npCommunicationId: string,
  trophyTitlePlatform: string
) => {
  try {
    // Get the credentials used by psn_api
    const { accessToken, accountId } = await PSN_AUTH.getCredentials();
    const psnApiTrophyList = await getGameTrophiesInfo(
      accessToken,
      accountId,
      npCommunicationId,
      trophyTitlePlatform
    );

    const gameTrophiesList = await UserGamesTrophies.findOneAndUpdate(
      {
        userId: userId,
      },
      {
        $set: {
          "gamesTrophies.$[e1].trophies": psnApiTrophyList,
          updatedAt: new Date(),
        },
      },
      {
        upsert: true,
        new: true,
        arrayFilters: [{ "e1.npCommunicationId": npCommunicationId }],
        timestamps: { createdAt: false, updatedAt: true },
      }
    );

    await gameTrophiesList?.save();

    return gameTrophiesList;
  } catch (error: unknown) {
    if (error instanceof MongooseError) {
      console.log(error);
      return error;
    }
  }
};

/**
 * Get the list of trophies by game
 *
 * @param userId
 * @param npCommunicationId
 * @returns
 */
export const getDbTrophyListByGame = async (
  userId: string,
  npCommunicationId: string
) => {
  try {
    const gameTrophies = await UserGamesTrophies.aggregate([
      // Match the documents by query
      {
        $match: {
          userId: new Types.ObjectId(userId),
          "gamesTrophies.npCommunicationId": npCommunicationId,
        },
      },
      // De-normalize nested array
      {
        $unwind: "$gamesTrophies",
      },
      {
        $unwind: "$gamesTrophies.trophies",
      },
      // Group the intermediate result.
      {
        $group: {
          _id: "$gamesTrophies._id",
          userId: {
            $first: "$userId",
          },
          npCommunicationId: {
            $first: "$gamesTrophies.npCommunicationId",
          },
          trophies: {
            $push: "$gamesTrophies.trophies",
          },
          createdAt: {
            $first: "$gamesTrophies.createdAt",
          },
          updatedAt: {
            $first: "$gamesTrophies.updatedAt",
          },
        },
      },
    ]).then((result) => result[0]);

    return gameTrophies;
  } catch (error: unknown) {
    if (error instanceof MongooseError) {
      console.log(error);
      return error;
    }
  }
};

interface IBulkResponse<T> {
  name: string;
  message: string;
  data: { [key: string]: string | number | object | Array<T> };
  isError: boolean;
}

/**
 * Get the params for insert trophies list bulk
 *
 * @param userGames
 * @param userId
 * @returns
 */
export const getBulkTrophiesList = async (
  userGames: IUserGames,
  userId: string
) => {
  const bulkTrohiesList = [];
  const gameTrophiesBulk: { npCommunicationId: string; trophies: ITrophy[] }[] =
    [];

  const bulkResSuccess: IBulkResponse<string> = {
    name: "getBulkTrophiesList",
    message: "BULK OK: Trophies Lists added/updated into DB with success",
    data: {
      totalGames: userGames.games.length,
      totalInsertDb: 0,
      gamesTrohiesList: new Array<string>(),
    },
    isError: false,
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
      (bulkResSuccess.data.gamesTrohiesList as string[]).push(gameMsg);

      count++;
      console.log(`${count}/${userGames.games.length} - ${gameMsg}`);
    })
  );

  bulkResSuccess.data.totalInsertDb = count;

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

  return { bulkTrohiesList, bulkResSuccess };
};

/**
 * Executes the trohpies list insert/update bulk
 *
 * @param userGames
 * @param userId
 * @returns
 */
export const execUpsertBulkTrophiesList = async (
  userGames: IUserGames,
  userId: string
) => {
  const { bulkTrohiesList, bulkResSuccess } = await getBulkTrophiesList(
    userGames,
    userId
  );

  let bulkResponse: IBulkResponse<string> = bulkResSuccess;

  await UserGamesTrophies.bulkWrite(bulkTrohiesList)
    .then((bulkWriteOpResult) => {
      bulkResponse = bulkResSuccess;

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

//TODO Get the list of trophies stats for each of the user's titles (batch).
// Get the list of trophies stats for each of the user's titles.
// const getAllGamesTrophiesInfoList = async (): Promise<GameStats[]> => {};
