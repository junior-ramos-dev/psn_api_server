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

//Get the game trophies list.
const getGameTrophiesList = async (
  npCommunicationId: string,
  trophyTitlePlatform: string
): Promise<TitleThinTrophy[]> => {
  //FIXME Get accessToken/accountId from the request
  const { trophies: gameTrophiesList } = await getTitleTrophies(
    { accessToken: "envAccessToken"! },
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
  npCommunicationId: string,
  trophyTitlePlatform: string
): Promise<TitleThinTrophy[]> => {
  //FIXME Get accessToken/accountId from the request
  const { trophies: gameEarnedTrophies } = await getUserTrophiesEarnedForTitle(
    { accessToken: "envAccessToken"! },
    "envAccountId"!,
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

//TODO Refactor after create function to get single game trophy list
//Get the list of trophies stats for each of the user's titles.
const getGameTrophiesInfo = async (game: TrophyTitle): Promise<GameStats> => {
  const gameTrophies = await getGameTrophiesList(
    game.npCommunicationId,
    game.trophyTitlePlatform
  );
  const gameEarnedTrophies = await getGameTrophiesEarnedList(
    game.npCommunicationId,
    game.trophyTitlePlatform
  );

  let gameStats: GameStats;

  if (gameTrophies !== undefined && gameEarnedTrophies !== undefined) {
    const mergedTrophies = mergeTrophyLists(gameTrophies, gameEarnedTrophies);

    const trophyList = new Array<TrophyInfo>();

    mergedTrophies.forEach((obj) => {
      let item = JSON.stringify(obj);
      let trophyItem = ConvertTrophyInfo.toTrophyInfo(item);
      trophyList.push(trophyItem);
    });

    gameStats = new GameStats(
      game.trophyTitleName,
      game.trophyTitlePlatform,
      game.definedTrophies,
      game.earnedTrophies,
      trophyList
    );
  }
  return new Promise((resolve, reject) => {
    return resolve(gameStats);
  });
};

//TODO Refactor after create function to get single game trophy list
//Get the list of trophies stats for each of the user's titles.
const getAllGamesTrophiesInfoList = async (): Promise<GameStats[]> => {
  let mergedTrophiesList: GameStats[] = [];

  for (const game of trophyTitles) {
    const gameTrophies = await getGameTrophiesList(
      game.npCommunicationId,
      game.trophyTitlePlatform
    );
    const gameEarnedTrophies = await getGameTrophiesEarnedList(
      game.npCommunicationId,
      game.trophyTitlePlatform
    );

    if (gameTrophies !== undefined && gameEarnedTrophies !== undefined) {
      const mergedTrophies = mergeTrophyLists(gameTrophies, gameEarnedTrophies);

      const trophyList = new Array<TrophyInfo>();

      mergedTrophies.forEach((obj) => {
        let item = JSON.stringify(obj);
        let trophyItem = ConvertTrophyInfo.toTrophyInfo(item);
        trophyList.push(trophyItem);
      });

      const gameStats = new GameStats(
        game.trophyTitleName,
        game.trophyTitlePlatform,
        game.definedTrophies,
        game.earnedTrophies,
        trophyList
      );

      mergedTrophiesList.push(gameStats);
    }
  }
  return new Promise((resolve, reject) => {
    return resolve(mergedTrophiesList);
  });
};

export { getGameTrophiesInfo, getAllGamesTrophiesInfoList };
