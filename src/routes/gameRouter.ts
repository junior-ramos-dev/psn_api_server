import express from "express";
import { getUserGames } from "../controllers/gameController";
import { validateRequest } from "../middlewares/requestValidators";

const router = express.Router();

router.get("/", getUserGames);

// router.get("/:id", gameController.getGame);

// router.post("/", gameController.postGame);

// router.patch("/:id", gameController.patchGame);

// router.delete("/:id", gameController.deleteGame);

export default router;
