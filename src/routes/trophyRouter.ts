import express from "express";

import {
  createTrophiesListForAllGamesBulk,
  getTrophiesByGame,
} from "@/controllers/trophyController";

const trophyRouter = express.Router();

// Get the list of trohpies for a single game by user
trophyRouter.get(
  "/:trophyTitlePlatform/:npCommunicationId/list",
  getTrophiesByGame
);

// Get the list of trohpies for all games by user
trophyRouter.get("/bulk", createTrophiesListForAllGamesBulk);

export default trophyRouter;
