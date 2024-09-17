import { Schema } from "mongoose";

import {
  IGameTrophyGroups,
  ITrophyDefinedGroupInfo,
  ITrophyEarnedGroupInfo,
  ITrophyGroupsInfo,
} from "../interfaces/trophyGroups";

import { TrophyCountSchema, TrophySchema } from "./trophy";

export const TrophyDefinedGroupInfoSchema = new Schema<ITrophyDefinedGroupInfo>(
  {
    trophyGroupId: {
      type: String,
      required: true,
    },
    trophyGroupName: {
      type: String,
      required: true,
    },
    trophyGroupIconUrl: {
      type: String,
      required: true,
    },
    definedTrophies: {
      type: TrophyCountSchema,
      required: true,
    },
  }
);

export const TrophyEarnedGroupInfoSchema = new Schema<ITrophyEarnedGroupInfo>({
  trophyGroupId: {
    type: String,
    required: true,
  },
  progress: {
    type: Number,
    required: true,
  },
  earnedTrophies: {
    type: TrophyCountSchema,
    required: true,
  },
});

export const TrophyGroupsInfoSchema = new Schema<ITrophyGroupsInfo>({
  definedGroupInfo: {
    type: TrophyDefinedGroupInfoSchema,
    required: true,
  },
  earnedGroupInfo: {
    type: TrophyEarnedGroupInfoSchema,
    required: true,
  },
  groupTrophies: {
    type: [TrophySchema],
    required: true,
  },
});

export const GameTrophyGroupsSchema = new Schema<IGameTrophyGroups>({
  npCommunicationId: {
    type: String,
    required: true,
  },
  npServiceName: {
    type: String,
    required: true,
  },
  trophyTitleName: {
    type: String,
    required: true,
  },
  trophyTitleIconUrl: {
    type: String,
    required: true,
  },
  trophyTitlePlatform: {
    type: String,
    required: true,
  },
  definedTrophies: {
    type: TrophyCountSchema,
    required: true,
  },
  trophyGroupsInfo: {
    type: [TrophyGroupsInfoSchema],
    required: true,
  },
});
