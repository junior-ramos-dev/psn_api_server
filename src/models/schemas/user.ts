import bcrypt from "bcryptjs";
import mongoose, { Schema } from "mongoose";

import { IUser, IUserGames } from "../interfaces/user";

import { GameSchema } from "./game";

const userSchema = new Schema<IUser>({
  name: {
    type: String,
    required: true,
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

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.comparePassword = async function (enteredPassword: string) {
  return await bcrypt.compare(enteredPassword, this.password);
};

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

const User = mongoose.model("User", userSchema);
const UserGames = mongoose.model("UserGames", UserGamesSchema);

export { User, UserGames };
