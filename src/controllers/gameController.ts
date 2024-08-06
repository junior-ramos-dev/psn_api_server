import { Request, Response, NextFunction } from "express";
import {
  createDbGamesByUser,
  updateDbGamesByUser,
  getDbGamesByUser,
} from "../services/repositories/gameRepository";
import User from "../models/schemas/user";
import { UserGames } from "../models/schemas/game";
import etag from "etag";
import { isFreshEtagHeader } from "../utils/api";
import { IGame } from "src/models/interfaces/game";
import { validationResult } from "express-validator";

const getGamesByUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  //Validate Request Headers
  const errors = validationResult(req); // Encontra os erros de validação nesta solicitação e os envolve em um objeto com funções úteis

  if (!errors.isEmpty()) {
    res.status(422).json({ errors: errors.array() });
    return;
  }

  try {
    const userId = req.params["userId"];
    const user = await User.findById(userId);

    const userGamesExists = await UserGames.findOne({
      userId: user!._id,
    }).lean();

    let gamesByUser;

    if (userGamesExists) {
      gamesByUser = await getDbGamesByUser(user!._id);

      res.setHeader("etag", etag(Buffer.from(JSON.stringify(gamesByUser))));

      const isFreshEtag = isFreshEtagHeader(req, res);
      console.log("isFreshEtag: ", isFreshEtag);

      const currentDate = new Date();
      const updatedAt = userGamesExists.updatedAt;
      console.log(currentDate, updatedAt);

      // Check updatedAt to retrive new data from psnApi after 2 hours
      const diffHours =
        Math.abs(currentDate.getTime() - updatedAt.getTime()) / 3600000;
      console.log(diffHours);

      //TODO Set the diff to a lower value for prod
      if (isFreshEtag && diffHours > 1000) {
        gamesByUser = await updateDbGamesByUser(user!._id);
        console.log("updated userGames on DB");
      } else if (isFreshEtag && diffHours < 1000) {
        console.log(
          "Not Modified. You can continue using the same cached version of the response."
        );
        res.status(304).send();
      } else if (!isFreshEtag) {
        console.log("returned userGames from DB");
        res.json(gamesByUser);
      }
    } else {
      gamesByUser = await createDbGamesByUser(user!._id);
      console.log("created userGames on DB");

      res.json(gamesByUser);
    }
  } catch (error) {
    console.log(error);
  }
};

export { getGamesByUser };

// async function getGame(req: Request, res: Response, next: NextFunction) {
//   const id = req.params.id;
//   const game = await gameRepository.getGame(parseInt(id));
//   if (game) res.json(game);
//   else res.sendStatus(404);
// }

// async function postGame(req: Request, res: Response, next: NextFunction) {
//   const game = req.body as Game;
//   const result = await gameRepository.addGame(game);
//   if (result) res.status(201).json(result);
//   else res.sendStatus(400);
// }

// async function patchGame(req: Request, res: Response, next: NextFunction) {
//   const id = req.params.id;
//   const game = req.body as Game;
//   const result = await gameRepository.updateGame(parseInt(id), game);
//   if (result) res.json(result);
//   else res.sendStatus(404);
// }

// async function deleteGame(req: Request, res: Response, next: NextFunction) {
//   const id = req.params.id;
//   const success = await gameRepository.deleteGame(parseInt(id));
//   if (success) res.sendStatus(204);
//   else res.sendStatus(404);
// }
