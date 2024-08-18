import express from "express";

import {
  createOrUpdateAllGamesTrophiesBulk,
  getTrophiesByGame,
} from "@/controllers/trophyController";

const router = express.Router();

// Get the list of trohpies for a single game by user
router.get(
  "/:userId/:trophyTitlePlatform/:npCommunicationId/list",
  getTrophiesByGame
);

// Get the list of trohpies for all games by user
router.get("/:userId/bulk", createOrUpdateAllGamesTrophiesBulk);

export default router;
