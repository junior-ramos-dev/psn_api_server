import mongoose, { Types } from "mongoose";

import { IGame, IGameTrophies } from "../game";

import { IUserProfile } from "./profile";

export interface IAuthUser {
  /**
   * The user's unique identifier
   * @type {string}
   * @memberof IAuthUser
   * @property id
   * @required
   * @example
   * "5e8d8hg8h8h8q8faf8g8f8f"
   */
  id: string;

  /**
   * The PSN usersname
   * @type {string}
   * @memberof IAuthUser
   * @property name
   * @required
   * @example
   * "JohnSmith"
   */
  psnOnlineId: string;

  /**
   * The user's email address
   * @type {string}
   * @memberof IAuthUser
   * @property email
   * @required
   * @example
   * "john.smith@welcomedeveloper.com"
   */
  email: string;
}

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

export interface IUserGames extends mongoose.Document {
  userId: Types.ObjectId;
  games: IGame[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserSingleGame extends mongoose.Document {
  userId: Types.ObjectId;
  game: IGame;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserGamesTrophies {
  userId: Types.ObjectId;
  gamesTrophies: IGameTrophies[];
  createdAt: Date;
  updatedAt: Date;
}
