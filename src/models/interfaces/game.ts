import mongoose from "mongoose";

import { TROPHY_POINTS_MAP, TROPHY_TYPE_NAME } from "../types/trophy";

import { ITrophy, ITrophyCount } from "./trophy";

export interface IGame {
  npCommunicationId: string;
  npServiceName: string;
  trophySetVersion: string;
  trophyTitleName: string;
  trophyTitleDetail: string;
  trophyTitleIconUrl: string;
  trophyTitlePlatform: string;
  hasTrophyGroups: boolean;
  trophyGroupCount: number;
  definedTrophies: ITrophyCount;
  progress: number;
  earnedTrophies: ITrophyCount;
  hiddenFlag: boolean;
  lastUpdatedDateTime: Date;
  definedTrophiesPoints: number;
  earnedTrophiesPoints: number;
}

export interface IGameTrophies extends mongoose.Document {
  npCommunicationId: string;
  trophyTitlePlatform: string;
  trophies: ITrophy[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IGameIcon {
  npCommunicationId: string;
  trophyTitleName: string;
  trophyTitleIconUrl: string;
  iconBinPng: string;
  iconBinWebp: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IGamesTrophiesBulk {
  npCommunicationId: string;
  trophyTitlePlatform: string;
  trophies: ITrophy[];
}

// Converts JSON strings to/from your types
export class Convert {
  public static toIGame(json: string): IGame {
    return JSON.parse(json);
  }

  public static iGameToJson(value: IGame): string {
    return JSON.stringify(value);
  }

  public static toIGameArray(jsonArray: object[]) {
    const gamesList = new Array<IGame>();

    jsonArray.forEach((obj) => {
      const item = JSON.stringify(obj);
      const gameItem = Convert.toIGame(item);

      gameItem.definedTrophiesPoints = getTrophiesTotalPoints(
        gameItem.definedTrophies
      );
      gameItem.earnedTrophiesPoints = getTrophiesTotalPoints(
        gameItem.earnedTrophies
      );

      gamesList.push(gameItem);
    });
    return gamesList;
  }
}

const getTrophiesTotalPoints = (trophyCount: ITrophyCount) => {
  let count: number = 0;

  count += trophyCount.bronze * TROPHY_POINTS_MAP[TROPHY_TYPE_NAME.BRONZE];
  count += trophyCount.silver * TROPHY_POINTS_MAP[TROPHY_TYPE_NAME.SILVER];
  count += trophyCount.gold * TROPHY_POINTS_MAP[TROPHY_TYPE_NAME.GOLD];
  count += trophyCount.platinum * TROPHY_POINTS_MAP[TROPHY_TYPE_NAME.PLATINUM];

  return count;
};
