import express from "express";

import {
  getEarnedTrophyTypesStats,
  getTrophyListByGame,
  updateTrophyIsChecked,
  upsertTrophiesForAllGamesBulk,
} from "@/controllers/trophyController";
import { authenticate } from "@/middlewares/authMiddleware";

const trophyRouter = express.Router();

// Get the list of trohpies for a single game by user
trophyRouter.get(
  "/:npCommunicationId/:trophyTitlePlatform/list",
  authenticate,
  getTrophyListByGame
);

// Update the the trophy 'isChecked' field
trophyRouter.patch(
  "/:npCommunicationId/:trophyTitlePlatform/checked",
  authenticate,
  updateTrophyIsChecked
);

// Get the list of trohpies for all games by user
trophyRouter.get("/bulk", authenticate, upsertTrophiesForAllGamesBulk);

//stats
trophyRouter.post("/stats", authenticate, getEarnedTrophyTypesStats);

export default trophyRouter;
