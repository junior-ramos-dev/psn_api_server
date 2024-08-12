import express from "express";
import {
  getGameIconBinByGame,
  getGameIconBinByListOfGamesIds,
  getGamesByUser,
} from "../controllers/gameController";
import { validateRequest } from "../middlewares/requestValidators";

const router = express.Router();

router.get("/:userId", validateRequest("headers")!, getGamesByUser);

router.get("/icon/:npCommunicationId", getGameIconBinByGame);

router.post("/icon/list", getGameIconBinByListOfGamesIds);

// router.get("/:id", gameController.getGame);

// router.post("/", gameController.postGame);

// router.patch("/:id", gameController.patchGame);

// router.delete("/:id", gameController.deleteGame);

export default router;
