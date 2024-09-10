import { Types } from "mongoose";

import { servicesErrorHandler } from "@/models/interfaces/common/error";
import { IGameTrophies } from "@/models/interfaces/game";
import { IUserGamesTrophies } from "@/models/interfaces/user/user";
import { GameTrophies } from "@/models/schemas/game";
import { UserGamesTrophies } from "@/models/schemas/user/user";
import { getPsnGameParsedTrophies } from "@/services/psnApi/trophies";

/**
 * Get or Create (if not exists) the list of trophies by game
 *
 * @param userId
 * @param npCommunicationId
 * @param trophyTitlePlatform
 * @returns
 */
export const getOrCreateDbUserGamesTrophies = async (
  userId: string
): Promise<IUserGamesTrophies | undefined> => {
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
    //Handle the error
    servicesErrorHandler(error);
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
): Promise<IGameTrophies | undefined> => {
  try {
    // Get the list of trophies by game from psn_api
    const psnApiTrophyList = await getPsnGameParsedTrophies(
      npCommunicationId,
      trophyTitlePlatform
    );

    const gameTrophyList = new GameTrophies({
      npCommunicationId: npCommunicationId,
      trophyTitlePlatform: trophyTitlePlatform,
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

    return gameTrophyList as IGameTrophies;
  } catch (error: unknown) {
    //Handle the error
    servicesErrorHandler(error);
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
): Promise<IUserGamesTrophies | undefined> => {
  try {
    // Get the list of trophies by game from psn_api
    const psnApiTrophyList = await getPsnGameParsedTrophies(
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
        arrayFilters: [
          {
            "e1.npCommunicationId": npCommunicationId,
            "e1.trophyTitlePlatform": trophyTitlePlatform,
          },
        ],
        timestamps: { createdAt: false, updatedAt: true },
      }
    );

    await gameTrophiesList?.save();

    return gameTrophiesList as IUserGamesTrophies;
  } catch (error: unknown) {
    //Handle the error
    servicesErrorHandler(error);
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
  npCommunicationId: string,
  trophyTitlePlatform: string
): Promise<IUserGamesTrophies | undefined> => {
  try {
    const gameTrophies = await UserGamesTrophies.aggregate(
      [
        { $match: { userId: new Types.ObjectId(userId) } },
        { $unwind: "$gamesTrophies" },
        {
          $match: { "gamesTrophies.trophyTitlePlatform": trophyTitlePlatform },
        },
        { $match: { "gamesTrophies.npCommunicationId": npCommunicationId } },
        { $project: { _id: 0, userId: 1, gamesTrophies: 1 } },
      ]

      //   [
      //   // Match the documents by query
      //   {
      //     $match: {
      //       userId: new Types.ObjectId(userId),
      //       "gamesTrophies.npCommunicationId": npCommunicationId,
      //       "gamesTrophies.trophyTitlePlatform": trophyTitlePlatform,
      //     },
      //   },
      //   // De-normalize nested array
      //   {
      //     $unwind: "$gamesTrophies",
      //   },
      //   {
      //     $unwind: "$gamesTrophies.trophies",
      //   },
      //   // Group the result.
      //   {
      //     $group: {
      //       _id: "$gamesTrophies._id",
      //       userId: {
      //         $first: "$userId",
      //       },
      //       npCommunicationId: {
      //         $first: "$gamesTrophies.npCommunicationId",
      //       },
      //       trophyTitlePlatform: {
      //         $first: "$gamesTrophies.trophyTitlePlatform",
      //       },
      //       trophies: {
      //         $push: "$gamesTrophies.trophies",
      //       },
      //       createdAt: {
      //         $first: "$gamesTrophies.createdAt",
      //       },
      //       updatedAt: {
      //         $first: "$gamesTrophies.updatedAt",
      //       },
      //     },
      //   },
      // ]
    ).then((result) => result[0]);

    return gameTrophies as IUserGamesTrophies;
  } catch (error: unknown) {
    //Handle the error
    servicesErrorHandler(error);
  }
};
