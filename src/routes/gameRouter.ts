import express from "express";

import {
  getGameIconBinByGame,
  getGameIconBinByListOfGamesIds,
  getGamesByUser,
} from "@/controllers/gameController";
import { authenticate } from "@/middlewares/authMiddleware";
import { validateEtagHeader } from "@/middlewares/validations/request/defaults";

const gameRouter = express.Router();

gameRouter.get("/list", validateEtagHeader(), authenticate, getGamesByUser);

gameRouter.get("/icon/:npCommunicationId", authenticate, getGameIconBinByGame);

gameRouter.post("/icon/list", authenticate, getGameIconBinByListOfGamesIds);

// gameRouter.patch("/:id", patchGame);

// gameRouter.delete("/:id", deleteGame);

export default gameRouter;
