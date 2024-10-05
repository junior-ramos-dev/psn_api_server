import express from "express";

import {
  getUserGameByIdAndPlatform,
  getUserGameDetails,
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

//Game
gameRouter.get("/list", authenticate, upsertAllGamesByUser);

export default gameRouter;
