import express from "express";

import {
  getUserGameByIdAndPlatform,
  getUserGameDetails,
  getUserGameDetailsList,
  upsertAllGamesByUser,
} from "@/controllers/gameController";
import { authenticate } from "@/middlewares/authMiddleware";

const gameRouter = express.Router();

//Game
gameRouter.get(
  "/:npCommunicationId/:trophyTitlePlatform",
  authenticate,
  getUserGameByIdAndPlatform
);

//Game  [?imgType=:imgType&getTrophies=:getTrophies]
gameRouter.get(
  "/:npCommunicationId/:trophyTitlePlatform/details",
  authenticate,
  getUserGameDetails
);

//Game  [?limit=5&offset=0&imgType=webp&getTrophies=1]
gameRouter.get("/details", authenticate, getUserGameDetailsList);

//Game
gameRouter.get("/list", authenticate, upsertAllGamesByUser);

export default gameRouter;
