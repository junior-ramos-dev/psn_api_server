import {
  getTitleTrophies,
  getUserTrophiesEarnedForTitle,
  Trophy,
} from "psn-api";
import type { TitleThinTrophy } from "psn-api/dist/models/title-thin-trophy.model";
import { ITrophy } from "src/models/interfaces/trophy";

import {
  CAPITALIZE_TYPE_MAP,
  POINTS_MAP,
  RARITY_MAP,
} from "@/models/types/trophy";

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
      npServiceName: trophyTitlePlatform !== "PS5" ? "trophy" : "trophy2", //TODO Get trophyTitlePlatform option from request
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
        : "trophy2",
    }
  );
  return gameEarnedTrophies;
};

//Get the list of trophies info for a single game
const getGameTrophiesInfo = async (
  accessToken: string,
  accountId: string,
  npCommunicationId: string,
  trophyTitlePlatform: string
): Promise<ITrophy[]> => {
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

  let mergedTrophies = new Array<ITrophy>();

  if (gameTrophies !== undefined && gameEarnedTrophies !== undefined) {
    mergedTrophies = mergeTrophyLists(gameTrophies, gameEarnedTrophies);
  }
  return new Promise((resolve, reject) => {
    try {
      return resolve(mergedTrophies);
    } catch (error) {
      return reject(error);
    }
  });
};

const mergeTrophyLists = (
  titleTrophies: Trophy[],
  earnedTrophies: Trophy[]
) => {
  const mergedTrophies: ITrophy[] = [];

  for (const earnedTrophy of earnedTrophies) {
    const foundTitleTrophy = titleTrophies.find(
      (t) => t.trophyId === earnedTrophy.trophyId
    );

    mergedTrophies.push(
      normalizeTrophy({ ...earnedTrophy, ...foundTitleTrophy })
    );
  }

  return mergedTrophies;
};

const normalizeTrophy = (trophy: Trophy) => {
  const nonEarnedDateTime = new Date(0).toISOString();

  const trophyNormalized: ITrophy = {
    trophyId: trophy.trophyId,
    trophyHidden: trophy.trophyHidden,
    isEarned: trophy.earned,
    isEarnedDateTime: trophy.earned ? trophy.earnedDateTime : nonEarnedDateTime,
    trophyType: CAPITALIZE_TYPE_MAP[trophy.trophyType ?? trophy.trophyType],
    trophyRare: trophy.trophyRare,
    trophyEarnedRate: Number(trophy.trophyEarnedRate),
    trophyName: trophy.trophyName,
    trophyDetail: trophy.trophyDetail,
    trophyIconUrl: trophy.trophyIconUrl,
    trophyGroupId: trophy.trophyGroupId,
    rarity: RARITY_MAP[trophy.trophyRare ?? 0],
    groupId: trophy.trophyGroupId,
    points: POINTS_MAP[trophy.trophyType ?? 0],
  };

  return trophyNormalized;
};

export { mergeTrophyLists, normalizeTrophy };

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
