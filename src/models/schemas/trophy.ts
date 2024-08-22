import { Schema } from "mongoose";

import {
  ITrophy,
  ITrophyCount,
  ITrophySummary,
} from "@/models/interfaces/trophy";

export const TrophySchema = new Schema<ITrophy>({
  trophyId: {
    type: Number,
    required: true,
  },
  trophyHidden: {
    type: Boolean,
    required: true,
  },
  isEarned: {
    type: Boolean,
    required: true,
  },
  isEarnedDateTime: {
    type: String,
    required: true,
  },
  trophyType: {
    type: String,
    required: true,
  },
  trophyRare: {
    type: String,
    required: true,
  },
  trophyEarnedRate: {
    type: Number,
    required: true,
  },
  trophyName: {
    type: String,
    required: true,
  },
  trophyDetail: {
    type: String,
    required: true,
  },
  trophyIconUrl: {
    type: String,
    required: true,
  },
  trophyGroupId: {
    type: String,
    required: true,
  },
  rarity: {
    type: String,
    required: true,
  },
  groupId: {
    type: String,
    required: true,
  },
  points: {
    type: Number,
    required: true,
  },
});

export const TrophyCount = new Schema<ITrophyCount>({
  bronze: {
    type: Number,
    required: true,
  },
  silver: {
    type: Number,
    required: true,
  },
  gold: {
    type: Number,
    required: true,
  },
  platinum: {
    type: Number,
    required: true,
  },
});

export const TrophySummary = new Schema<ITrophySummary>({
  level: {
    type: Number,
    required: true,
  },
  progress: {
    type: Number,
    required: true,
  },
  earnedTrophies: {
    type: TrophyCount,
    required: true,
  },
});
