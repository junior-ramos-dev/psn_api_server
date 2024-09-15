import { Types } from "mongoose";

import { servicesErrorHandler } from "@/models/interfaces/common/error";
import { Convert, IGameIcon } from "@/models/interfaces/game";
import { IUserGames } from "@/models/interfaces/user";
import {
  IUserGameDetails,
  IUserSingleGame,
} from "@/models/interfaces/user/user";
import { GameIcon } from "@/models/schemas/game";
import { UserGames, UserGamesTrophies } from "@/models/schemas/user";
import {
  IGameDetailsProjecton,
  IGameIconProjecton,
  IMG_TYPE,
} from "@/models/types/game";
import { getTrophyTitles } from "@/services/psnApi/games";
import { dolwnloadImgToBase64, resizeImgToWebpBase64 } from "@/utils/download";

/**
 * Create the list of games by user
 *
 * @param userId
 * @returns
 */
export const createDbGamesByUser = async (
  userId: string
): Promise<IUserGames | undefined> => {
  try {
    // Get the user's list of titles (games) from psn_api
    const psnApiGames = await getTrophyTitles();

    const gamesList = Convert.toIGameArray(psnApiGames);

    const userGames = await UserGames.create({
      userId: userId,
      games: gamesList,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return userGames as IUserGames;
  } catch (error: unknown) {
    //Handle the error
    servicesErrorHandler(error);
  }
};

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
 * Update the lsit of games by user
 *
 * @param userId
 * @returns
 */
export const updateDbGamesByUserId = async (
  userId: string
): Promise<IUserGames | undefined> => {
  try {
    // Get the user's list of titles (games) from psn_api
    const psnApiGames = await getTrophyTitles();

    const gamesList = Convert.toIGameArray(psnApiGames);

    const userGames = await UserGames.findOneAndUpdate(
      { userId: userId },
      {
        $set: { games: gamesList, updatedAt: new Date() },
      },
      {
        new: true,
        timestamps: { createdAt: false, updatedAt: true },
      }
    );

    await userGames?.save();

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
  trophyTitlePlatform: string,
  npCommunicationId: string
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
  getTrophies: number = 0
): Promise<IUserGameDetails | undefined> => {
  try {
    const gameDetailProjection: IGameDetailsProjecton = {
      _id: 0,
      userId: 1,
      usergame: 1,
      gameIcon: 1,
      trophies: 1,
      totalPoints: 1,
    };

    // If "getTrophies is false, remove the trophy list from the result projection
    if (!getTrophies) delete gameDetailProjection.trophies;

    let gameIconType = "";
    // Define the img type to be returned
    switch (imgType.toLowerCase()) {
      case IMG_TYPE.PNG:
        gameIconType = "$gameIcon.iconBinPng";
        break;
      case IMG_TYPE.WEBP:
        gameIconType = "$gameIcon.iconBinWebp";
        break;
    }

    const userGameWithTrophies = await UserGamesTrophies.aggregate([
      // Make reference to the usergames collection using the "userId"
      {
        $lookup: {
          from: "usergames",
          localField: "usergames.userId",
          foreignField: "gamesTrophies.userId",
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
      // Unwind gameTrohpies array
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
          trophies: {
            $first: "$gamesTrophies.trophies",
          },
          // Get the icon bin with PNG format
          gameIcon: {
            $first: gameIconType,
          },
        },
      },
      // Add the totalPoints field as the sum of points of all trophies for the specified game
      {
        $addFields: {
          totalPoints: {
            $sum: "$trophies.points",
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

/**
 * Get the game icon binary data
 *
 * @param npCommunicationId
 * @returns
 */
export const getDbGameIconBin = async (
  npCommunicationId: string
): Promise<IGameIcon | undefined | null> => {
  try {
    const gameIconBin = await GameIcon.findOne({
      npCommunicationId: npCommunicationId,
    });

    return gameIconBin;
  } catch (error: unknown) {
    //Handle the error
    servicesErrorHandler(error);
  }
};

/**
 * Get the game icon binary data by type (PNG/WEBP)
 *
 * @param npCommunicationId
 * @param imgType
 * @returns
 */
export const getDbGameIconBinByImgType = async (
  npCommunicationId: string,
  imgType: string
): Promise<IGameIcon | undefined | null> => {
  try {
    const iconProjection: IGameIconProjecton = {
      npCommunicationId: 1,
      trophyTitleName: 1,
      trophyTitleIconUrl: 1,
      iconBinPng: 1,
      iconBinWebp: 1,
      createdAt: 1,
      updatedAt: 1,
    };

    switch (imgType.toLowerCase()) {
      case IMG_TYPE.PNG:
        delete iconProjection.iconBinWebp;
        break;
      case IMG_TYPE.WEBP:
        delete iconProjection.iconBinPng;
        break;
    }

    const gameIconBin = await GameIcon.aggregate([
      // Match the documents by query
      {
        $match: {
          npCommunicationId: npCommunicationId,
        },
      },

      // Project the result.
      {
        $project: iconProjection,
      },
    ]);

    return gameIconBin[0] as IGameIcon;
  } catch (error: unknown) {
    //Handle the error
    servicesErrorHandler(error);
  }
};

/**
 * Get a list of game icon binary data from an array of "npCommunicationId"
 *
 * @param npCommIdList
 * @returns
 */
export const getDbGameIconBinByListOfGamesIds = async (
  npCommIdList: string[],
  imgType: string
): Promise<IGameIcon[] | undefined> => {
  try {
    const iconProjection: IGameIconProjecton = {
      npCommunicationId: 1,
      trophyTitleName: 1,
      trophyTitleIconUrl: 1,
      iconBinPng: 1,
      iconBinWebp: 1,
      createdAt: 1,
      updatedAt: 1,
    };

    switch (imgType.toLowerCase()) {
      case IMG_TYPE.PNG:
        delete iconProjection.iconBinWebp;
        break;
      case IMG_TYPE.WEBP:
        delete iconProjection.iconBinPng;
        break;
    }

    const gameIconBinList = await GameIcon.aggregate([
      // Match the documents by query
      {
        $match: {
          npCommunicationId: { $in: [...npCommIdList] },
        },
      },

      // Project the result.
      {
        $project: iconProjection,
      },
    ]);

    return gameIconBinList as IGameIcon[];
  } catch (error: unknown) {
    //Handle the error
    servicesErrorHandler(error);
  }
};

/**
 * Download the game icon (if not exists yet) and insert as binary data in the collection "gamesicons"
 * aside from the "usergames" collection.
 */
export const createDbGameIconBin = async (
  userGames: IUserGames
): Promise<void> => {
  try {
    let count = 1;

    const games = userGames.games;

    for (const game of games) {
      const gamesIconExists = await GameIcon.findOne({
        npCommunicationId: game.npCommunicationId,
      }).lean();

      if (gamesIconExists) {
        console.log(
          `[${count}/${games.length}] Game Icon already exists: ${game.trophyTitleName};`
        );
      } else {
        console.log(
          `[${count}/${games.length}] Downloading Game Icon: ${game.trophyTitleName};`
        );

        const iconPngBase64 = await dolwnloadImgToBase64(
          game.trophyTitleIconUrl
        );

        const iconWebpBase64 = await resizeImgToWebpBase64(
          iconPngBase64,
          60,
          40
        );

        await GameIcon.create({
          npCommunicationId: game.npCommunicationId,
          trophyTitleName: game.trophyTitleName,
          trophyTitleIconUrl: game.trophyTitleIconUrl,
          iconBinPng: iconPngBase64,
          iconBinWebp: iconWebpBase64,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
      count++;
    }
  } catch (error: unknown) {
    //Handle the error
    servicesErrorHandler(error);
  }
};
