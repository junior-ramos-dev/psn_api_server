// To parse this data:
//
//   import { ConvertIPsnProfile, IProfile } from "./file";
//
//   const iPsnProfile = ConvertIPsnProfile.fromJson(json);

import { Types } from "mongoose";

import { ITrophySummary } from "../trophy";

export interface IProfile {
  userId: Types.ObjectId;
  onlineId: string;
  accountId: string;
  npId: string;
  avatarUrls: IAvatarURL[];
  plus: number;
  aboutMe: string;
  languagesUsed: string[];
  trophySummary: ITrophySummary;
  isOfficiallyVerified: boolean;
  personalDetail: IPersonalDetail;
  personalDetailSharing: string;
  personalDetailSharingRequestMessageFlag: boolean;
  primaryOnlineStatus: string;
  presences: IPresence[];
  friendRelation: string;
  requestMessageFlag: boolean;
  blocking: boolean;
  following: boolean;
  consoleAvailability: IConsoleAvailability;
}

export interface IAvatarURL {
  size: string;
  avatarUrl: string;
}

export interface IPersonalDetail {
  firstName: string;
  lastName: string;
}

export interface IPresence {
  onlineStatus: string;
  hasBroadcastData: boolean;
  lastOnlineDate: Date;
}

export interface IConsoleAvailability {
  availabilityStatus: string;
}

// Converts JSON strings to/from your types
export class ConvertIPsnProfile {
  public static fromJson(json: string): IProfile {
    return JSON.parse(json);
  }

  public static toJson(value: IProfile): string {
    return JSON.stringify(value);
  }
}
