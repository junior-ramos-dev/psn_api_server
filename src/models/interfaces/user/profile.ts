// To parse this data:
//
//   import { ConvertIPsnProfile, IProfile } from "./file";
//
//   const iPsnProfile = ConvertIPsnProfile.fromJson(json);

import { ITrophySummary } from "../trophy";

export interface IProfile {
  onlineId: string;
  accountId: string;
  npId: string;
  avatarUrls: AvatarURL[];
  plus: number;
  aboutMe: string;
  languagesUsed: string[];
  trophySummary: ITrophySummary;
  isOfficiallyVerified: boolean;
  personalDetail: PersonalDetail;
  personalDetailSharing: string;
  personalDetailSharingRequestMessageFlag: boolean;
  primaryOnlineStatus: string;
  presences: Presence[];
  friendRelation: string;
  requestMessageFlag: boolean;
  blocking: boolean;
  following: boolean;
  consoleAvailability: ConsoleAvailability;
}

export interface AvatarURL {
  size: string;
  avatarUrl: string;
}

export interface ConsoleAvailability {
  availabilityStatus: string;
}

export interface PersonalDetail {
  firstName: string;
  lastName: string;
}

export interface Presence {
  onlineStatus: string;
  hasBroadcastData: boolean;
  lastOnlineDate: Date;
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
