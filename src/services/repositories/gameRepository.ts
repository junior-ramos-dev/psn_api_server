import { servicesErrorHandler } from "@/models/interfaces/common/error";
import { Convert, IGameIcon } from "@/models/interfaces/game";
import { IUserGames } from "@/models/interfaces/user";
import { GameIcon } from "@/models/schemas/game";
import { UserGames } from "@/models/schemas/user";
import { IGameIconProjecton, IMG_TYPE } from "@/models/types/game";
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
 * Update the lsit of games by user
 *
 * @param userId
 * @returns
 */
export const getDbUserGameByNpCommunicationId = async (
  userId: string,
  npCommunicationId: string
): Promise<IUserGames | undefined> => {
  try {
    const userGames = await UserGames.findOne({
      userId: userId,
      games: {
        $elemMatch: { npCommunicationId: npCommunicationId },
      },
    });

    return userGames as IUserGames;
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
  npCommIdList: string[]
): Promise<IGameIcon[] | undefined> => {
  try {
    const gameIconBinList = await GameIcon.find({
      npCommunicationId: { $in: [...npCommIdList] },
    });

    return gameIconBinList;
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

        // console.log(iconBase64);

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
