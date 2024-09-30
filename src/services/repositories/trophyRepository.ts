import { Types } from "mongoose";

import { servicesErrorHandler } from "@/models/interfaces/common/error";
import { IGameTrophies } from "@/models/interfaces/game";
import { IUserGamesTrophies } from "@/models/interfaces/user/user";
import { GameTrophies } from "@/models/schemas/game";
import { UserGamesTrophies } from "@/models/schemas/user/user";
import { getPsnParsedTrophiesGroupsByGame } from "@/services/psnApi/trophies";

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
    const psnApiTrophyList = await getPsnParsedTrophiesGroupsByGame(
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
 * Get the list of trophies by game
 *
 * @param userId
 * @param npCommunicationId
 * @returns
 */
export const getDbTrophyListByGame = async (
  userId: string,
  trophyTitlePlatform: string,
  npCommunicationId: string
): Promise<IUserGamesTrophies | undefined> => {
  try {
    const gameTrophies = await UserGamesTrophies.aggregate([
      { $match: { userId: new Types.ObjectId(userId) } },
      { $unwind: "$gamesTrophies" },
      {
        $match: { "gamesTrophies.trophyTitlePlatform": trophyTitlePlatform },
      },
      { $match: { "gamesTrophies.npCommunicationId": npCommunicationId } },
      {
        $project: {
          _id: 0,
          userId: 1,
          gamesTrophies: 1,
          totalPoints: {
            $sum: "$gamesTrophies.trophies.points",
          },
        },
      },
    ]).then((result) => result[0]);

    return gameTrophies as IUserGamesTrophies;
  } catch (error: unknown) {
    //Handle the error
    servicesErrorHandler(error);
  }
};

/**
 * Set the field 'isChecked' from a trophy
 *
 * @param userId
 * @param npCommunicationId
 * @param trophyTitlePlatform
 * @param trophyGroupId
 * @param trophyId
 * @param isChecked
 * @returns
 */
export const updateDbTrophyIsChecked = async (
  userId: string,
  npCommunicationId: string,
  trophyTitlePlatform: string,
  trophyGroupId: string,
  trophyId: number,
  isChecked: boolean
) => {
  try {
    await UserGamesTrophies.findOneAndUpdate(
      {
        userId: new Types.ObjectId(userId),
      },
      {
        $set: {
          "gamesTrophies.$[e1].trophyGroups.trophyGroupsInfo.$[e2].groupTrophies.$[e3].isChecked":
            isChecked, //"gamesTrophies.$[e1].trophyGroups.trophyGroupsInfo.$[e2].wares.$[e3].reserved": "2"
        },
      },
      {
        arrayFilters: [
          {
            "e1.npCommunicationId": npCommunicationId,
            "e1.trophyTitlePlatform": trophyTitlePlatform,
          },
          {
            "e2.trophyGroupId": trophyGroupId,
          },
          {
            "e3.trophyId": trophyId,
          },
        ],
      }
    );

    return true;
  } catch (error: unknown) {
    //Handle the error
    servicesErrorHandler(error);
  }
};
