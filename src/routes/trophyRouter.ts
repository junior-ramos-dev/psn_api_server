import express from "express";

import { getTrophiesByGame } from "@/controllers/trophyController";

const router = express.Router();

router.get(
  "/:userId/:trophyTitlePlatform/:npCommunicationId/list",
  getTrophiesByGame
);

export default router;
