import express from "express";

import {
  createOrUpdateAllGamesTrophiesBulk,
  getTrophiesByGame,
} from "@/controllers/trophyController";

const trophyRouter = express.Router();

// Get the list of trohpies for a single game by user
trophyRouter.get(
  "/:userId/:trophyTitlePlatform/:npCommunicationId/list",
  getTrophiesByGame
);

// Get the list of trohpies for all games by user
trophyRouter.get("/:userId/bulk", createOrUpdateAllGamesTrophiesBulk);

export default trophyRouter;
