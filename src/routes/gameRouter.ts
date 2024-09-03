import express from "express";

import {
  getGameIconBinByGame,
  getGameIconBinByListOfGamesIds,
  getGamesByUser,
} from "@/controllers/gameController";
import { authenticate } from "@/middlewares/authMiddleware";

const gameRouter = express.Router();

gameRouter.get("/list", authenticate, getGamesByUser);

gameRouter.get("/icon/:npCommunicationId", authenticate, getGameIconBinByGame);

gameRouter.post("/icon/list", authenticate, getGameIconBinByListOfGamesIds);

export default gameRouter;
