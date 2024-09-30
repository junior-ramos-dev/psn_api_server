import express from "express";

import {
  getTrophyListByGame,
  upsertTrophiesForAllGamesBulk,
} from "@/controllers/trophyController";
import { authenticate } from "@/middlewares/authMiddleware";

const trophyRouter = express.Router();

// Get the list of trohpies for a single game by user
trophyRouter.get(
  "/:trophyTitlePlatform/:npCommunicationId/list",
  authenticate,
  getTrophyListByGame
);

// Get the list of trohpies for all games by user
trophyRouter.get("/bulk", authenticate, upsertTrophiesForAllGamesBulk);

export default trophyRouter;
