import bcrypt from "bcryptjs";
import mongoose, { Schema } from "mongoose";

import {
  IUser,
  IUserGames,
  IUserGamesTrophies,
} from "@/models/interfaces/user/user";

import { GameSchema, GameTrophiesSchema } from "../game";

const UserSchema = new Schema<IUser>({
  psnOnlineId: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
});

UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

UserSchema.methods.comparePassword = async function (enteredPassword: string) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Model for the list of games from a user
const UserGamesSchema = new Schema<IUserGames>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      userId: true,
      index: true,
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

// Model for all game's trophy list from a user
const UserGamesTrophiesSchema = new Schema<IUserGamesTrophies>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      unique: true,
      index: true,
    },
    gamesTrophies: {
      type: [GameTrophiesSchema],
      default: [],
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

const User = mongoose.model<IUser>("User", UserSchema);
const UserGames = mongoose.model<IUserGames>("UserGames", UserGamesSchema);
const UserGamesTrophies = mongoose.model<IUserGamesTrophies>(
  "UserGamesTrophies",
  UserGamesTrophiesSchema
);

export { User, UserGames, UserGamesTrophies };
