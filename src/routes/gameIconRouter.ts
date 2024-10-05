import express from "express";

import {
  getGameIconBin,
  getGameIconBinByImgType,
  getGamesIconBinListByIds,
} from "@/controllers/gameIconController";
import { authenticate } from "@/middlewares/authMiddleware";

const gameIconRouter = express.Router();

//Icon
gameIconRouter.get("/icon/:npCommunicationId", authenticate, getGameIconBin);

//Icon
gameIconRouter.get(
  "/icon/:npCommunicationId/:imgType",
  authenticate,
  getGameIconBinByImgType
);

//Icon
gameIconRouter.post("/icon/list", authenticate, getGamesIconBinListByIds);

export default gameIconRouter;
