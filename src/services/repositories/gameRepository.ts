import { MongooseError } from "mongoose";

import { PSN_AUTH } from "@/controllers/authController";
import { Convert } from "@/models/interfaces/game";
import { IUserGames } from "@/models/interfaces/user";
import { GameIcon } from "@/models/schemas/game";
import { UserGames } from "@/models/schemas/user";
import { getTrophyTitles } from "@/services/psnApi/games";
import { dolwnloadFileToBase64 } from "@/utils/download";

/**
 * Create the list of games by user
 *
 * @param userId
 * @returns
 */
export const createDbGamesByUser = async (userId: string) => {
  try {
    // Get the credentials used by psn_api
    const { accessToken, accountId } = PSN_AUTH.getCredentials();
    const psnApiGames = await getTrophyTitles(accessToken, accountId);

    const gamesList = Convert.toIGameArray(psnApiGames);

    const userGames = await UserGames.create({
      userId: userId,
      games: gamesList,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return userGames as IUserGames;
  } catch (error: unknown) {
    if (error instanceof MongooseError) {
      console.log(error);
      return error;
    }
  }
};

/**
 * Get games by user and add (populate) the virtual reference from GameIcon schema
 *
 * @param userId
 * @returns
 */
export const getDbGamesByUserId = async (
  userId: string
): Promise<IUserGames | undefined | MongooseError> => {
  try {
    const userGames = await UserGames.findOne({ userId: userId });
    // .populate({
    //   path: "games.gameIconBin",
    //   select: "iconBinaryData",
    //   // model: "gameiscons",
    // });

    return userGames as IUserGames;
  } catch (error: unknown) {
    if (error instanceof MongooseError) {
      console.log(error);
      return error;
    }
  }
};

/**
 * Update the lsit of games by user
 *
 * @param userId
 * @returns
 */
export const updateDbGamesByUser = async (
  userId: string
): Promise<IUserGames | undefined | MongooseError> => {
  try {
    // Get the credentials used by psn_api
    const { accessToken, accountId } = PSN_AUTH.getCredentials();
    const psnApiGames = await getTrophyTitles(accessToken, accountId);

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
    if (error instanceof MongooseError) {
      console.log(error);
      return error;
    }
  }
};

/**
 * Get the game icon binary data
 *
 * @param npCommunicationId
 * @returns
 */
export const getDbGameIconBin = async (npCommunicationId: string) => {
  try {
    const gameIconBin = await GameIcon.findOne({
      npCommunicationId: npCommunicationId,
    });

    return gameIconBin;
  } catch (error: unknown) {
    if (error instanceof MongooseError) {
      console.log(error);
      return error;
    }
  }
};

/**
 * Get a list of game icon binary data from an array of "npCommunicationId"
 *
 * @param npCommIdList
 * @returns
 */
export const getDbGameIconBinByListOfGamesIds = async (
  npCommIdList: string[]
) => {
  try {
    const gameIconBinList = await GameIcon.find({
      npCommunicationId: { $in: [...npCommIdList] },
    });

    return gameIconBinList;
  } catch (error: unknown) {
    if (error instanceof MongooseError) {
      console.log(error);
      return error;
    }
  }
};

/**
 * Download the game icon (if not exists yet) and insert as binary data in the collection "gamesicons"
 * aside from the "usergames" collection.
 */
export const createDbGameIconBin = async (userGames: IUserGames) => {
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
        const iconBase64 = await dolwnloadFileToBase64(game.trophyTitleIconUrl);

        console.log(iconBase64);

        await GameIcon.create({
          npCommunicationId: game.npCommunicationId,
          trophyTitleName: game.trophyTitleName,
          trophyTitleIconUrl: game.trophyTitleIconUrl,
          iconBinaryData: iconBase64,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
      count++;
    }
  } catch (error: unknown) {
    if (error instanceof MongooseError) {
      console.log(error);
      return error;
    }
  }
};
