import type { TitleThinTrophy } from "psn-api/dist/models/title-thin-trophy.model";
import {
  TrophyTitle,
  getTitleTrophies,
  getUserTrophiesEarnedForTitle,
} from "psn-api";
import { GameStats } from "../models/gameStats";
import { ConvertTrophyInfo, TrophyInfo } from "../models/trophyInfo";
import { mergeTrophyLists } from "../utils/trophies";
import fs from "fs";

//FIXME ========================================================//
const getGamesList = (): TrophyTitle[] => {
  //TODO Change to use getTrophyTitles from gameRepository
  const gamesData = fs.readFileSync("./games.json", {
    encoding: "utf8",
    flag: "r",
  });
  const trophyTitlesJson = JSON.parse(gamesData);

  return trophyTitlesJson;
};

//TODO Remove self-executing anonymous function using TS.
let trophyTitles: TrophyTitle[];
(() => {
  trophyTitles = getGamesList();
})();
// END FIXME ====================================================//

//Get the list of trophies for each of the user's titles.
const getTrophyTitlesList = async (
  title: TrophyTitle
): Promise<TitleThinTrophy[]> => {
  //FIXME Get accessToken/accountId from the request
  const { trophies: titleTrophies } = await getTitleTrophies(
    { accessToken: "envAccessToken"! },
    title.npCommunicationId,
    "all",
    {
      npServiceName: title.trophyTitlePlatform !== "PS5" ? "trophy" : undefined,
    }
  );

  return titleTrophies;
};

//Get the list of earned trophies for each of the user's titles.
const getTrophiesEarnedForTitle = async (
  title: TrophyTitle
): Promise<TitleThinTrophy[]> => {
  //FIXME Get accessToken/accountId from the request
  const { trophies: earnedTrophies } = await getUserTrophiesEarnedForTitle(
    { accessToken: "envAccessToken"! },
    "envAccountId"!,
    title.npCommunicationId,
    "all",
    {
      npServiceName: !title.trophyTitlePlatform.includes("PS5")
        ? "trophy"
        : undefined,
    }
  );
  return earnedTrophies;
};

//TODO Refactor after create function to get single game trophy list
//Get the list of trophies stats for each of the user's titles.
const getGameTrophiesStatsForTitles = async (): Promise<GameStats[]> => {
  let mergedTrophiesList: GameStats[] = [];

  for (const title of trophyTitles) {
    const titleTrophies = await getTrophyTitlesList(title);
    const earnedTrophies = await getTrophiesEarnedForTitle(title);

    if (titleTrophies !== undefined && earnedTrophies !== undefined) {
      const mergedTrophies = mergeTrophyLists(titleTrophies, earnedTrophies);

      const trophyList = new Array<TrophyInfo>();

      mergedTrophies.forEach((obj) => {
        let item = JSON.stringify(obj);
        let trophyItem = ConvertTrophyInfo.toTrophyInfo(item);
        trophyList.push(trophyItem);
      });

      const gameStats = new GameStats(
        title.trophyTitleName,
        title.trophyTitlePlatform,
        title.definedTrophies,
        title.earnedTrophies,
        trophyList
      );

      mergedTrophiesList.push(gameStats);
    }
  }
  return new Promise((resolve, reject) => {
    return resolve(mergedTrophiesList);
  });
};

export { getGameTrophiesStatsForTitles };
