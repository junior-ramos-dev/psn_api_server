import { MongooseError, Types } from "mongoose";

import { GameTrophies } from "@/models/schemas/game";
import { PSN_AUTH, psnAuthFactory } from "@/services/psnApi/auth";
import { getGameTrophiesInfo } from "@/services/psnApi/trophies";

/**
 * Create the list of trophies by game
 *
 * @param userId
 * @param npCommunicationId
 * @param trophyTitlePlatform
 * @returns
 */
export const createDbTrophiesByGame = async (
  userId: Types.ObjectId,
  npCommunicationId: string,
  trophyTitlePlatform: string
) => {
  // psnAuthFactory get and keep PSN access token in memory
  const { accessToken, accountId } = await psnAuthFactory(PSN_AUTH);
  const psnApiTrophyList = await getGameTrophiesInfo(
    accessToken,
    accountId,
    npCommunicationId,
    trophyTitlePlatform
  );
  // const gamesList = Convert.toIGameArray(psnApiGames);

  let gameTrophiesList;

  try {
    gameTrophiesList = await GameTrophies.create({
      userId: userId,
      npCommunicationId: npCommunicationId,
      trophies: psnApiTrophyList,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  } catch (error: unknown) {
    if (error instanceof MongooseError) {
      console.log(error);
    }
  }

  return gameTrophiesList;
};

/**
 * Get the list of trophies by game
 *
 * @param userId
 * @param npCommunicationId
 * @returns
 */
export const getDbTrophiesByGame = async (
  userId: Types.ObjectId,
  npCommunicationId: string
) => {
  const gameTrophiesList = await GameTrophies.findOne({
    userId: userId,
    npCommunicationId: npCommunicationId,
  });
  // const gamesList = Convert.toIGameArray(userGames!.games);

  return gameTrophiesList;
};

export const updateDbTrophiesByGame = async (
  userId: Types.ObjectId,
  npCommunicationId: string,
  trophyTitlePlatform: string
) => {
  // psnAuthFactory get and keep PSN access token in memory
  const { accessToken, accountId } = await psnAuthFactory(PSN_AUTH);
  const psnApiTrophyList = await getGameTrophiesInfo(
    accessToken,
    accountId,
    npCommunicationId,
    trophyTitlePlatform
  );
  // const gamesList = Convert.toIGameArray(psnApiGames);
  let gameTrophiesList;

  try {
    gameTrophiesList = await GameTrophies.findOneAndUpdate(
      { userId: userId, npCommunicationId: npCommunicationId },
      {
        $set: { games: psnApiTrophyList, updatedAt: new Date() },
      },
      {
        new: true,
        timestamps: { createdAt: false, updatedAt: true },
      }
    );

    await gameTrophiesList?.save();
  } catch (error: unknown) {
    if (error instanceof MongooseError) {
      console.log(error);
    }
  }

  return gameTrophiesList;
};

//TODO Get the list of trophies stats for each of the user's titles (bulk).
// Get the list of trophies stats for each of the user's titles.
// const getAllGamesTrophiesInfoList = async (): Promise<GameStats[]> => {
//   let mergedTrophiesList: GameStats[] = [];

//   for (const game of trophyTitles) {
//     const gameTrophies = await getGameTrophiesList(
//       accessToken,
//       npCommunicationId,
//       trophyTitlePlatform
//     );

//     const gameEarnedTrophies = await getGameTrophiesEarnedList(
//       accessToken,
//       accountId,
//       npCommunicationId,
//       trophyTitlePlatform
//     );

//     if (gameTrophies !== undefined && gameEarnedTrophies !== undefined) {
//       const mergedTrophies = mergeTrophyLists(gameTrophies, gameEarnedTrophies);

//       const trophyList = new Array<TrophyInfo>();

//       mergedTrophies.forEach((obj) => {
//         let item = JSON.stringify(obj);
//         let trophyItem = ConvertTrophyInfo.toTrophyInfo(item);
//         trophyList.push(trophyItem);
//       });

//       const gameStats = new GameStats(
//         game.trophyTitleName,
//         game.trophyTitlePlatform,
//         game.definedTrophies,
//         game.earnedTrophies,
//         trophyList
//       );

//       mergedTrophiesList.push(gameStats);
//     }
//   }
//   return new Promise((resolve, reject) => {
//     return resolve(mergedTrophiesList);
//   });
// };
