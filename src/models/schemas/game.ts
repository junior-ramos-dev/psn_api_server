import mongoose, { Schema } from "mongoose";

import { IGame, IGameIcon, IUserGames } from "../interfaces/game";

import { TrophyCount } from "./trophy";

//Model for Game
const GameSchema = new Schema<IGame>(
  {
    npCommunicationId: {
      type: String,
      required: true,
      unique: true,
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
      type: TrophyCount,
      required: true,
    },
    earnedTrophies: {
      type: TrophyCount,
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
      unique: true,
    },
    trophyTitleName: {
      type: String,
      required: true,
    },
    trophyTitleIconUrl: {
      type: String,
      required: true,
    },
    iconBinaryData: {
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

// Model for the list of games from a user
const UserGamesSchema = new Schema<IUserGames>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    games: [GameSchema],
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

const Game = mongoose.model("Game", GameSchema);
const GameIcon = mongoose.model("GameIcon", GameIconSchema);
const UserGames = mongoose.model("UserGames", UserGamesSchema);

export { Game, GameIcon,UserGames };
