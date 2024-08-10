import express from "express";
import {
  getDbGameIconBinByGame,
  getGamesByUser,
} from "../controllers/gameController";
import { validateRequest } from "../middlewares/requestValidators";

const router = express.Router();

router.get("/:userId", validateRequest("headers")!, getGamesByUser);

router.get("/icon/:npCommunicationId", getDbGameIconBinByGame);

// router.get("/:id", gameController.getGame);

// router.post("/", gameController.postGame);

// router.patch("/:id", gameController.patchGame);

// router.delete("/:id", gameController.deleteGame);

export default router;
