import express from "express";

import {
  createTrophiesListForAllGamesBulk,
  getTrophiesByGame,
} from "@/controllers/trophyController";
import { authenticate } from "@/middlewares/authMiddleware";

const trophyRouter = express.Router();

// Get the list of trohpies for a single game by user
trophyRouter.get(
  "/:trophyTitlePlatform/:npCommunicationId/list",
  authenticate,
  getTrophiesByGame
);

// Get the list of trohpies for all games by user
trophyRouter.get("/bulk", authenticate, createTrophiesListForAllGamesBulk);

export default trophyRouter;
