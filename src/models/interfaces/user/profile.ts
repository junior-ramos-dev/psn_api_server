// To parse this data:
//
//   import { ConvertIUserProfile, IUserProfile } from "./file";
//
//   const iUserProfile = ConvertIUserProfile.fromJson(json);

import { Types } from "mongoose";

import { ITrophySummary } from "../trophy";

export interface IUserProfile {
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
  createdAt: Date;
  updatedAt: Date;
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
export class ConvertIUserProfile {
  public static fromJson(json: string): IUserProfile {
    return JSON.parse(json);
  }

  public static toJson(value: IUserProfile): string {
    return JSON.stringify(value);
  }
}
