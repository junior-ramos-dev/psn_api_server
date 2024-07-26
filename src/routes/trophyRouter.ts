import express from "express";
import { getGameTrophies } from "../controllers/trophyController";

const router = express.Router();

router.get("/list/:trophyTitlePlatform/:npCommunicationId", getGameTrophies);

export default router;
