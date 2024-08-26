import express from "express";

import {
  getGameIconBinByGame,
  getGameIconBinByListOfGamesIds,
  getGamesByUser,
} from "@/controllers/gameController";
import { REQUEST_PROPERTY, validateReq } from "@/middlewares/requestMiddleware";

const gameRouter = express.Router();

gameRouter.get(
  "/:userId/list",
  validateReq(REQUEST_PROPERTY.HEADERS),
  getGamesByUser
);

gameRouter.get("/icon/:npCommunicationId", getGameIconBinByGame);

gameRouter.post("/icon/list", getGameIconBinByListOfGamesIds);

// gameRouter.patch("/:id", patchGame);

// gameRouter.delete("/:id", deleteGame);

export default gameRouter;
