import express from "express";
import { getAllGamesTrophiesInfo } from "../controllers/trophyController";
import { validateRequest } from "../middlewares/requestValidators";

const router = express.Router();

router.get("/stats", validateRequest, getAllGamesTrophiesInfo);

// router.get("/:id", gameController.getGame);

// router.post("/", gameController.postGame);

// router.patch("/:id", gameController.patchGame);

// router.delete("/:id", gameController.deleteGame);

export default router;
