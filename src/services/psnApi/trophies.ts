import type { TitleThinTrophy } from "psn-api/dist/models/title-thin-trophy.model";
import { getTitleTrophies, getUserTrophiesEarnedForTitle } from "psn-api";
import type { Trophy } from "psn-api";
import { mergeTrophyLists } from "../../utils/trophies";

//Get the game trophies list.
const getGameTrophiesList = async (
  accessToken: string,
  npCommunicationId: string,
  trophyTitlePlatform: string
): Promise<TitleThinTrophy[]> => {
  const { trophies: gameTrophiesList } = await getTitleTrophies(
    { accessToken: accessToken },
    npCommunicationId,
    "all", //TODO Get trophyGroupId option from request
    {
      npServiceName: trophyTitlePlatform !== "PS5" ? "trophy" : undefined, //TODO Get trophyTitlePlatform option from request
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
  const { trophies: gameEarnedTrophies } = await getUserTrophiesEarnedForTitle(
    { accessToken: accessToken },
    accountId,
    npCommunicationId,
    "all", //TODO Get trophyGroupId option from request
    {
      npServiceName: !trophyTitlePlatform.includes("PS5") //TODO Get trophyTitlePlatform option from request
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
): Promise<Trophy[]> => {
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

  let mergedTrophies = new Array<Trophy>();

  if (gameTrophies !== undefined && gameEarnedTrophies !== undefined) {
    mergedTrophies = mergeTrophyLists(gameTrophies, gameEarnedTrophies);
  }
  return new Promise((resolve, reject) => {
    return resolve(mergedTrophies);
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
