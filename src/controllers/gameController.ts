import { Request, Response, NextFunction } from "express";
import { ConvertGame, Game } from "../models/game";
import { getTrophyTitles } from "../repositories/gameRepository";
import { formatStringToTitleCase } from "../utils/strings";

import { psnAuthFactory, PSN_AUTH } from "./authPsnController";

const getUserGames = async (
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

  //Get and keep PSN access token in memory
  const { accessToken, accountId } = await psnAuthFactory(PSN_AUTH);

  const games = await getTrophyTitles(accessToken, accountId);
  const gamesList = new Array<Game>();

  games.forEach((obj) => {
    let item = JSON.stringify(obj);
    let gameItem = ConvertGame.toGame(item);

    formatStringToTitleCase(gameItem.trophyTitleDetail);
    gamesList.push(gameItem);
  });

  res.json(gamesList);
};

export { getUserGames };

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
