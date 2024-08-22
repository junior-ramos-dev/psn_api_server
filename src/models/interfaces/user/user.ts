import { Types } from "mongoose";

import { IGame } from "../game";

export interface IUser extends Document {
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
