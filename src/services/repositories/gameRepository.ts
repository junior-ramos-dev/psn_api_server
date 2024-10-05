import { Types } from "mongoose";

import { servicesErrorHandler } from "@/models/interfaces/common/error";
import { IUserGames } from "@/models/interfaces/user";
import {
  IUserGameDetails,
  IUserSingleGame,
} from "@/models/interfaces/user/user";
import { UserGames, UserGamesTrophies } from "@/models/schemas/user";
import { IGameDetailsProjection, IMG_TYPE } from "@/models/types/game";

/**
 * Get games by user and add (populate) the virtual reference from GameIcon schema
 *
 * @param userId
 * @returns
 */
export const getDbGamesListByUserId = async (
  userId: string
): Promise<IUserGames | undefined> => {
  try {
    const userGames = await UserGames.findOne({ userId: userId });
    // .populate({
    //   path: "games.gameIconBin",
    //   select: "iconBinaryData",
    //   // model: "gameiscons",
    // });

    return userGames as IUserGames;
  } catch (error: unknown) {
    //Handle the error
    servicesErrorHandler(error);
  }
};

/**
 * Get games by trophyTitlePlatform and npCommunicationId
 *
 * @param userId
 * @returns
 */
export const getDbUserGameByIdAndPlatform = async (
  userId: string,
  npCommunicationId: string,
  trophyTitlePlatform: string
): Promise<IUserSingleGame | undefined> => {
  try {
    const userGames = await UserGames.aggregate([
      { $match: { userId: new Types.ObjectId(userId) } },
      { $unwind: "$games" },
      {
        $match: { "games.trophyTitlePlatform": trophyTitlePlatform },
      },
      { $match: { "games.npCommunicationId": npCommunicationId } },
      {
        $project: {
          _id: 0,
          userId: 1,
          game: "$games",
          createdAt: 1,
          updatedAt: 1,
        },
      },
    ]).then((result) => result[0]);

    return userGames as IUserSingleGame;
  } catch (error: unknown) {
    //Handle the error
    servicesErrorHandler(error);
  }
};

/**
 * Get the user game with icon PNG/WEBP and with/without list of trophies;
 *
 * @param userId
 * @param trophyTitlePlatform
 * @param npCommunicationId
 * @param imgType @default webp
 * @param getTrophies @default false
 * @returns
 */
export const getDbUserGameDetails = async (
  userId: string,
  trophyTitlePlatform: string,
  npCommunicationId: string,
  imgType: string = IMG_TYPE.WEBP,
  getTrophies: number = 0 //false
): Promise<IUserGameDetails | undefined> => {
  try {
    const gameDetailProjection: IGameDetailsProjection = {
      _id: 0,
      userId: 1,
      usergame: 1,
      gameIcon: 1,
      trophyGroupsInfo: 1,
    };

    // If "getTrophies" is false, remove the trophy list from the result projection
    console.log(!getTrophies);
    if (!getTrophies) delete gameDetailProjection.trophyGroupsInfo;

    // Define WEBP as default image type
    let gameIconType = "$gameIcon.iconBinWebp";
    // Define the img type to be returned
    if (imgType.toLowerCase() === IMG_TYPE.PNG)
      gameIconType = "$gameIcon.iconBinPng";

    const userGameWithTrophies = await UserGamesTrophies.aggregate([
      // Make reference to the usergames collection using the "userId"
      {
        $lookup: {
          from: "usergames",
          localField: "usergames.userId",
          foreignField: "this.userId",
          as: "usergame",
        },
      },
      // Make reference to the gameicons collection from usergame collection using the "npCommunicationId"
      {
        $lookup: {
          from: "gameicons",
          localField: "npCommunicationId",
          foreignField: "usergame.games.npCommunicationId",
          as: "gameIcon",
        },
      },
      // Unwind gamesTrophies array
      {
        $unwind: "$gamesTrophies",
      },
      // Unwind userGame object
      {
        $unwind: "$usergame",
      },
      // Unwind usergame games array
      {
        $unwind: "$usergame.games",
      },
      // Unwind gameIcon object
      {
        $unwind: "$gameIcon",
      },
      {
        // Match userId, platform and npCommunicationId for the usergame
        $match: {
          userId: new Types.ObjectId(userId),
          "usergame.games.trophyTitlePlatform": trophyTitlePlatform,
          "usergame.games.npCommunicationId": npCommunicationId,
          "gameIcon.npCommunicationId": npCommunicationId,
          $expr: {
            // Expression to assert usergametrophies and usergame with same npCommunicationId
            $eq: [
              "$usergame.games.npCommunicationId",
              "$gamesTrophies.npCommunicationId",
            ],
            // Expression to assert usergametrophies and gameIcon with same npCommunicationId
            $eq: [
              "$gameIcon.npCommunicationId",
              "$gamesTrophies.npCommunicationId",
            ],
          },
        },
      },
      //Group the expected output fields
      {
        $group: {
          _id: "$_id",
          userId: {
            $first: "$userId",
          },
          usergame: {
            $first: "$usergame.games",
          },
          trophyGroupsInfo: {
            $first: "$gamesTrophies.trophyGroups.trophyGroupsInfo",
          },
          // Get the icon bin with the specified format
          gameIcon: {
            $first: gameIconType,
          },
        },
      },
      // Project the the final output excluding the "_id" field
      {
        $project: gameDetailProjection,
      },
    ]).then((result) => result[0]);

    return userGameWithTrophies as IUserGameDetails;
  } catch (error: unknown) {
    //Handle the error
    servicesErrorHandler(error);
  }
};
