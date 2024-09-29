import { ITrophy, ITrophyCount } from "./trophy";

// Interfaces for psn_api getTitleTrophyGroups response
export interface ITrophyDefinedGroupsResponse {
  npCommunicationId: string;
  npServiceName: string;
  trophySetVersion: string;
  trophyTitleName: string;
  trophyTitleIconUrl: string;
  trophyTitlePlatform: string;
  definedTrophies: ITrophyCount;
  trophyGroups: ITrophyGroup[];
}

export interface ITrophyGroup {
  trophyGroupId: string;
  trophyGroupName: string;
  trophyGroupIconUrl: string;
  definedTrophies: ITrophyCount;
}

// Converts JSON strings to/from your types
export class ConvertTrophyDefinedGroupsResponse {
  public static fromJson(json: string): ITrophyDefinedGroupsResponse {
    return JSON.parse(json);
  }

  public static toJson(value: ITrophyDefinedGroupsResponse): string {
    return JSON.stringify(value);
  }
}

// Interfaces for parsed trophy groups
export interface IGameTrophyGroups {
  allTrophiesCount: ITrophyCount;
  trophyGroupsInfo: ITrophyGroupsInfo[];
}

export interface ITrophyGroupsInfo {
  trophyGroupId: string;
  definedGroupInfo: ITrophyDefinedGroupInfo;
  earnedGroupInfo: ITrophyEarnedGroupInfo;
  groupTrophies: ITrophy[];
}

export interface ITrophyDefinedGroupInfo {
  trophyGroupId: string;
  trophyGroupName: string;
  trophyGroupIconUrl: string;
  definedTrophies: ITrophyCount;
}

export interface ITrophyEarnedGroupInfo {
  trophyGroupId: string;
  progress: number;
  earnedTrophies: ITrophyCount;
}
