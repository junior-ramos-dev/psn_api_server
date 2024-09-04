import mongoose from "mongoose";

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
}

export interface IGameTrophies extends mongoose.Document {
  npCommunicationId: string;
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

      gamesList.push(gameItem);
    });
    return gamesList;
  }
}
