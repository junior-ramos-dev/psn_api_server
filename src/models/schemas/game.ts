import mongoose, { Schema } from "mongoose";

import { IGame, IGameIcon, IGameTrophies } from "@/models/interfaces/game";

import { TrophyCountSchema } from "./trophy";
import { GameTrophyGroupsSchema } from "./trophyGroups";

//Model for Game
export const GameSchema = new Schema<IGame>(
  {
    npCommunicationId: {
      type: String,
      required: true,
    },
    npServiceName: {
      type: String,
      required: true,
    },
    trophySetVersion: {
      type: String,
      required: true,
    },
    trophyTitleName: {
      type: String,
      required: true,
    },
    trophyTitleDetail: {
      type: String,
      required: false,
    },
    trophyTitleIconUrl: {
      type: String,
      required: true,
    },
    trophyTitlePlatform: {
      type: String,
      required: true,
    },
    hasTrophyGroups: {
      type: Boolean,
      required: true,
    },
    trophyGroupCount: {
      type: Number,
      required: true,
    },
    definedTrophies: {
      type: TrophyCountSchema,
      required: true,
    },
    earnedTrophies: {
      type: TrophyCountSchema,
      required: true,
    },
    progress: {
      type: Number,
      required: true,
    },
    hiddenFlag: {
      type: Boolean,
      required: true,
    },
    lastUpdatedDateTime: {
      type: Date,
      required: true,
    },
    definedTrophiesPoints: {
      type: Number,
      required: true,
    },
    earnedTrophiesPoints: {
      type: Number,
      required: true,
    },
  }
  // {
  //   toJSON: { virtuals: true }, // So `res.json()` and other `JSON.stringify()` functions include virtuals
  //   toObject: { virtuals: true }, // So `console.log()` and other functions that use `toObject()` include virtuals
  // }
);

// Make a reference for the the GameIcon schema using the game "npCommunicationId"
// GameSchema.virtual("gameIconBin", {
//   ref: "GameIcon",
//   localField: "npCommunicationId",
//   foreignField: "npCommunicationId",
//   justOne: true, // for many-to-1 relationships
// });

// Model for the icon binary data for a game (trophyTitleIconUrl)
const GameIconSchema = new Schema<IGameIcon>(
  {
    npCommunicationId: {
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
    iconBinPng: {
      type: String,
      required: true,
    },
    iconBinWebp: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      required: true,
    },
    updatedAt: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

// Model for the list of trophies from a game
export const GameTrophiesSchema = new Schema<IGameTrophies>(
  {
    npCommunicationId: {
      type: String,
      required: true,
    },
    trophyTitlePlatform: {
      type: String,
      required: true,
    },
    trophyGroups: {
      type: GameTrophyGroupsSchema,
      required: true,
    },
    createdAt: {
      type: Date,
      required: true,
    },
    updatedAt: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

const GameIcon = mongoose.model<IGameIcon>("GameIcon", GameIconSchema);
const GameTrophies = mongoose.model<IGameTrophies>(
  "GameTrophies",
  GameTrophiesSchema
);

export { GameIcon, GameTrophies };
