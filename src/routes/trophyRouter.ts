import express from "express";
import { getGameTrophies } from "../controllers/trophyController";
import { validateRequest } from "../middlewares/requestValidators";

const router = express.Router();

router.get("/list/:trophyTitlePlatform/:npCommunicationId", getGameTrophies);
// router.get(
//   "/list/:trophyTitlePlatform/:npCommunicationId",
//   async function (req, res) {
//     // Retrieve the tag from our URL path
//     let p = req.params.trophyTitlePlatform;
//     let n = req.params.npCommunicationId;

//     console.log(p, n);

//     res.send(200);
//   }
// );
// router.get("/stats", validateRequest, getAllGamesTrophiesInfo);

// router.get("/:id", gameController.getGame);

// router.post("/", gameController.postGame);

// router.patch("/:id", gameController.patchGame);

// router.delete("/:id", gameController.deleteGame);

export default router;
