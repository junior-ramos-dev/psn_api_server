import etag from "etag";
import { Request, Response } from "express";
import { validationResult } from "express-validator";

import { UserGames } from "../models/schemas/game";
import User from "../models/schemas/user";
import {
  createDbGameIconBin,
  createDbGamesByUser,
  getDbGameIconBin,
  getDbGameIconBinByListOfGamesIds,
  getDbGamesByUser,
  updateDbGamesByUser,
} from "../services/repositories/gameRepository";
import { isFreshEtagHeader } from "../utils/api";

/** */
const getGamesByUser = async (req: Request, res: Response) => {
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

      /**
       * The ETag (or entity tag) HTTP response header is an identifier for a specific version of a resource.
       * It lets caches be more efficient and save bandwidth, as a web server does not need to resend a full response
       * if the content was not changed.
       *
       * See https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/ETag
       * */
      res.setHeader("etag", etag(Buffer.from(JSON.stringify(gamesByUser))));
      res.setHeader(
        "if-none-match",
        etag(Buffer.from(JSON.stringify(gamesByUser)))
      );
      const isFreshEtag = isFreshEtagHeader(req, res);

      // Interval in hours to request data from psnApi;
      //TODO Set the diff to 2 hours for prod
      const psnApiPollingInterval = 1000; //hours
      const currentDate = new Date();
      const updatedAt = userGamesExists.updatedAt;

      // Check the "updatedAt" from UserGames schema to retrieve new data from psnApi after 2 hours
      const diffHours =
        Math.abs(currentDate.getTime() - updatedAt.getTime()) / 3600000;

      console.log(currentDate, updatedAt);
      console.log(diffHours);

      console.log("isFreshEtag: ", isFreshEtag);

      if (isFreshEtag && diffHours > psnApiPollingInterval) {
        gamesByUser = await updateDbGamesByUser(user!._id);

        // Download and update (if not exists yet) the game image (trophyTitleIconUrl)
        // and insert as binary data in the collection "gamesicons"
        await createDbGameIconBin(gamesByUser);

        console.log("updated userGames on DB");
        res.json(gamesByUser);
      } else if (isFreshEtag && diffHours < psnApiPollingInterval) {
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

      // Download and create (if not exists yet) the game image (trophyTitleIconUrl)
      // and insert as binary data in the collection "gamesicons"
      await createDbGameIconBin(gamesByUser);

      res.json(gamesByUser);
    }
  } catch (error) {
    console.log(error);
  }
};

/**
 *
 */
const getGameIconBinByGame = async (req: Request, res: Response) => {
  try {
    const npCommunicationId = req.params["npCommunicationId"];

    const gameIconBin = await getDbGameIconBin(npCommunicationId);

    res.json(gameIconBin);
  } catch (error) {
    console.log(error);
  }
};

/**
 *
 */
const getGameIconBinByListOfGamesIds = async (req: Request, res: Response) => {
  try {
    const { npCommIdList } = req.body;
    const gameIconBin = await getDbGameIconBinByListOfGamesIds(npCommIdList);

    res.json(gameIconBin);
  } catch (error) {
    console.log(error);
  }
};

export { getGameIconBinByGame, getGameIconBinByListOfGamesIds,getGamesByUser };

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
