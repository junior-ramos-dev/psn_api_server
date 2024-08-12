import { ITrophyCount } from "./trophy";
import { Types } from "mongoose";

export interface IUserGames extends Document {
  userId: Types.ObjectId;
  games: IGame[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IGame extends Document {
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

export interface IGameIcon extends Document {
  npCommunicationId: string;
  trophyTitleName: string;
  trophyTitleIconUrl: string;
  iconBinaryData: string;
  createdAt: Date;
  updatedAt: Date;
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
