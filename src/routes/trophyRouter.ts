import express from "express";

import {
  getTrophiesByGame,
  upsertTrophiesForAllGamesBulk,
} from "@/controllers/trophyController";

const trophyRouter = express.Router();

// Get the list of trohpies for a single game by user
trophyRouter.get(
  "/:userId/:trophyTitlePlatform/:npCommunicationId/list",
  getTrophiesByGame
);

// Get the list of trohpies for all games by user
trophyRouter.get("/:userId/bulk", upsertTrophiesForAllGamesBulk);

export default trophyRouter;
