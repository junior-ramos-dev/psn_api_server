import express from "express";

import {
  getGameIconBin,
  getGameIconBinByImgType,
  getGamesIconBinListByIds,
} from "@/controllers/gameIconController";
import { authenticate } from "@/middlewares/authMiddleware";

const gameIconRouter = express.Router();

//Icon
gameIconRouter.get("/:npCommunicationId/icon", authenticate, getGameIconBin);

//Icon
gameIconRouter.get(
  "/:npCommunicationId/icon/:imgType",
  authenticate,
  getGameIconBinByImgType
);

//Icon
gameIconRouter.post("/icon/list", authenticate, getGamesIconBinListByIds);

export default gameIconRouter;
