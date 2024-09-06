import express from "express";

import {
  getGameIconBin,
  getGameIconBinByImgType,
  getGamesByUser,
  getGamesIconBinListByIds,
} from "@/controllers/gameController";
import { authenticate } from "@/middlewares/authMiddleware";

const gameRouter = express.Router();
//TODO Fix
gameRouter.get("/list", authenticate, getGamesByUser);

gameRouter.get(
  "/icon/:imgType/:npCommunicationId",
  authenticate,
  getGameIconBinByImgType
);
gameRouter.get("/icon/:npCommunicationId", authenticate, getGameIconBin);

gameRouter.post("/icon/list", authenticate, getGamesIconBinListByIds);

export default gameRouter;
