import mongoose, { Schema } from "mongoose";
import { IGame, IUserGames } from "../interfaces/game";
import { TrophyCount } from "./trophy";

const GameSchema = new Schema<IGame>({
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
});

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
const UserGames = mongoose.model("UserGames", UserGamesSchema);

export { Game, UserGames };
