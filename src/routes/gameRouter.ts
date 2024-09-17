import express from "express";

import {
  getGameIconBin,
  getGameIconBinByImgType,
  getGamesByUser,
  getGamesIconBinListByIds,
  getUserGameByIdAndPlatform,
  getUserGameDetails,
} from "@/controllers/gameController";
import { authenticate } from "@/middlewares/authMiddleware";

const gameRouter = express.Router();

//Icon
gameRouter.get("/:npCommunicationId/icon", authenticate, getGameIconBin);

//Game
gameRouter.get(
  "/:npCommunicationId/:trophyTitlePlatform",
  authenticate,
  getUserGameByIdAndPlatform
);

//Game
gameRouter.get(
  "/:npCommunicationId/:trophyTitlePlatform/details?imgType=:imgType&getTrophies=:getTrophies",
  authenticate,
  getUserGameDetails
);

//Game
gameRouter.get("/list", authenticate, getGamesByUser);

//Icon
gameRouter.get(
  "/:npCommunicationId/icon/:imgType",
  authenticate,
  getGameIconBinByImgType
);

//Icon
gameRouter.post("/icon/list", authenticate, getGamesIconBinListByIds);

export default gameRouter;
