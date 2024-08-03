import { Schema } from "mongoose";
import { ITrophyCount } from "../interfaces/trophy";

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
