import express from "express";

import {
  getGameIconBinByGame,
  getGameIconBinByListOfGamesIds,
  getGamesByUser,
} from "../controllers/gameController";
import {
  REQUEST_PROPERTY,
  validateReq,
} from "../middlewares/requestMiddleware";

const router = express.Router();

router.get("/:userId", validateReq(REQUEST_PROPERTY.HEADERS)!, getGamesByUser);

router.get("/icon/:npCommunicationId", getGameIconBinByGame);

router.post("/icon/list", getGameIconBinByListOfGamesIds);

// router.get("/:id", gameController.getGame);

// router.post("/", gameController.postGame);

// router.patch("/:id", gameController.patchGame);

// router.delete("/:id", gameController.deleteGame);

export default router;
