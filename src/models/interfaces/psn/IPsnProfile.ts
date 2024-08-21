// To parse this data:
//
//   import { Convert, IPsnProfile } from "./file";
//
//   const iPsnProfile = Convert.toIPsnProfile(json);

export interface IPsnProfile {
  onlineId: string;
  accountId: string;
  npId: string;
  avatarUrls: AvatarURL[];
  plus: number;
  aboutMe: string;
  languagesUsed: string[];
  trophySummary: TrophySummary;
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

export interface TrophySummary {
  level: number;
  progress: number;
  earnedTrophies: EarnedTrophies;
}

export interface EarnedTrophies {
  platinum: number;
  gold: number;
  silver: number;
  bronze: number;
}

// Converts JSON strings to/from your types
export class ConvertIPsnProfile {
  public static fromJson(json: string): IPsnProfile {
    return JSON.parse(json);
  }

  public static toJson(value: IPsnProfile): string {
    return JSON.stringify(value);
  }
}
