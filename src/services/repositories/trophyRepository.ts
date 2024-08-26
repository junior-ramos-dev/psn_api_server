import { MongooseError, Types } from "mongoose";

import { PSN_AUTH } from "@/controllers/authController";
import { IUserGamesTrophies } from "@/models/interfaces/user/user";
import { GameTrophies } from "@/models/schemas/game";
import { UserGamesTrophies } from "@/models/schemas/user/user";
import { getGameTrophiesInfo } from "@/services/psnApi/trophies";

//TODO Check if need to get the list of trophies stats.
// Get the list of trophies stats for each of the user's titles.
// const getAllGamesTrophiesInfoList = async (): Promise<GameStats[]> => {};

//TODO Error handling / return response

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
