import mongoose, { Types } from "mongoose";

import { IGame, IGameTrophies } from "../game";

import { IUserProfile } from "./profile";

export interface IUserAndProfile {
  userDb: IUser;
  userProfileDb: IUserProfile;
}

export interface IUser extends mongoose.Document {
  psnOnlineId: string;
  email: string;
  password: string;
  comparePassword: (enteredPassword: string) => boolean;
}

export interface IUserGames {
  userId: Types.ObjectId;
  games: IGame[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserGamesTrophies {
  userId: Types.ObjectId;
  gamesTrophies: IGameTrophies[];
  createdAt: Date;
  updatedAt: Date;
}
