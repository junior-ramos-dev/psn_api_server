import type { TitleThinTrophy } from "psn-api/dist/models/title-thin-trophy.model";
import { getTitleTrophies, getUserTrophiesEarnedForTitle } from "psn-api";

import { ConvertTrophyInfo, TrophyInfo } from "../models/trophyInfo";
import { mergeTrophyLists } from "../utils/trophies";

//Get the game trophies list.
const getGameTrophiesList = async (
  accessToken: string,
  npCommunicationId: string,
  trophyTitlePlatform: string
): Promise<TitleThinTrophy[]> => {
  //FIXME Get accessToken/accountId from the request
  const { trophies: gameTrophiesList } = await getTitleTrophies(
    { accessToken: accessToken },
    npCommunicationId,
    "all",
    {
      npServiceName: trophyTitlePlatform !== "PS5" ? "trophy" : undefined,
    }
  );

  return gameTrophiesList;
};

//Get the list of earned trophies for each of the user's titles.
const getGameTrophiesEarnedList = async (
  accessToken: string,
  accountId: string,
  npCommunicationId: string,
  trophyTitlePlatform: string
): Promise<TitleThinTrophy[]> => {
  //FIXME Get accessToken/accountId from the request
  const { trophies: gameEarnedTrophies } = await getUserTrophiesEarnedForTitle(
    { accessToken: accessToken },
    accountId,
    npCommunicationId,
    "all",
    {
      npServiceName: !trophyTitlePlatform.includes("PS5")
        ? "trophy"
        : undefined,
    }
  );
  return gameEarnedTrophies;
};

//Get the list of trophies info for a single game
const getGameTrophiesInfo = async (
  accessToken: string,
  accountId: string,
  npCommunicationId: any,
  trophyTitlePlatform: any
): Promise<TrophyInfo[]> => {
  const gameTrophies = await getGameTrophiesList(
    accessToken,
    npCommunicationId,
    trophyTitlePlatform
  );

  const gameEarnedTrophies = await getGameTrophiesEarnedList(
    accessToken,
    accountId,
    npCommunicationId,
    trophyTitlePlatform
  );

  const trophyList = new Array<TrophyInfo>();

  if (gameTrophies !== undefined && gameEarnedTrophies !== undefined) {
    const mergedTrophies = mergeTrophyLists(gameTrophies, gameEarnedTrophies);

    mergedTrophies.forEach((obj) => {
      let item = JSON.stringify(obj);
      let trophyItem = ConvertTrophyInfo.toTrophyInfo(item);
      trophyList.push(trophyItem);
    });
  }
  return new Promise((resolve, reject) => {
    return resolve(trophyList);
  });
};

//TODO FIXME - Change to use getTrophyTitles from gameRepository
//Get the list of trophies stats for each of the user's titles.
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

export { getGameTrophiesInfo };
