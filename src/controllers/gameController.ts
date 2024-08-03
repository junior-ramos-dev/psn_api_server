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

const getGamesByUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  //Validate Request Headers
  // const errors = validationResult(req); // Encontra os erros de validação nesta solicitação e os envolve em um objeto com funções úteis

  // if (!errors.isEmpty()) {
  //   res.status(422).json({ errors: errors.array() });
  //   return;
  // }
  const userId = req.params["userId"];
  const user = await User.findById(userId);

  const userGamesExists = await UserGames.findOne({
    userId: user!._id,
  });

  let gamesByUser;

  if (!userGamesExists) {
    gamesByUser = await createDbGamesByUser(user!._id);
    console.log("created userGames on DB");
  } else {
    const currentDate = new Date();
    const updatedAt = userGamesExists.updatedAt;
    console.log(currentDate, updatedAt);

    //Check date to retrive new data after 2 hours
    const diffHours =
      Math.abs(currentDate.getTime() - updatedAt.getTime()) / 3600000;
    console.log(diffHours);
    if (diffHours > 12) {
      gamesByUser = await updateDbGamesByUser(user!._id);
      console.log("updated userGames on DB");
    } else {
      gamesByUser = await getDbGamesByUser(user!._id);
      console.log("returned userGames from DB");
    }
  }

  res.json(gamesByUser);
};

// app.get("/games/etag")
//TODO Implement with DB
const getGamesWithEtag = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const body = {
      data: "Testing etag",
    };
    res.setHeader("etag", etag(Buffer.from(JSON.stringify(body))));
    if (isFreshEtagHeader(req, res)) {
      res.statusCode = 304;
      res.send();
    } else {
      res.statusCode = 200;
      res.send({ ...body });
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
