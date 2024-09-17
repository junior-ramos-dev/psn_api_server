import express from "express";

import {
  createTrophiesListForAllGamesBulk,
  getAllTrophiesByGame,
  getTrophiesGroupsByGame,
} from "@/controllers/trophyController";
import { authenticate } from "@/middlewares/authMiddleware";

const trophyRouter = express.Router();

// Get the list of trohpies for a single game by user
trophyRouter.get(
  "/:trophyTitlePlatform/:npCommunicationId/list",
  authenticate,
  getAllTrophiesByGame
);

// Get the trophy groups for a single game by user
trophyRouter.get(
  "/:trophyTitlePlatform/:npCommunicationId/group",
  authenticate,
  getTrophiesGroupsByGame
);

// Get the list of trohpies for all games by user
trophyRouter.get("/bulk", authenticate, createTrophiesListForAllGamesBulk);

export default trophyRouter;
