import etag from "etag";
import { Request, Response } from "express";
import { validationResult } from "express-validator";

import { GameTrophies } from "../models/schemas/game";
import { User } from "../models/schemas/user";
import {
  createDbTrophiesByGame,
  getDbTrophiesByGame,
  updateDbTrophiesByGame,
} from "../services/repositories/trophyRepository";
import { isFreshEtagHeader } from "../utils/api";

/**
 *
 * @param req
 * @param res
 * @returns
 */
const getTrophiesByGame = async (req: Request, res: Response) => {
  // Validate Request Headers
  // Find and validate the request properties
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    res.status(422).json({ errors: errors.array() });
    return;
  }

  try {
    const userId = req.params["userId"];
    const npCommunicationId = req.params["npCommunicationId"];
    const trophyTitlePlatform = req.params["trophyTitlePlatform"];
    const user = await User.findById(userId);

    const gameTrophiesExists = await GameTrophies.findOne({
      userId: user!._id,
      npCommunicationId: npCommunicationId,
    }).lean();

    let trophiesByGame;

    if (gameTrophiesExists) {
      trophiesByGame = await getDbTrophiesByGame(user!._id, npCommunicationId);

      /**
       * The ETag (or entity tag) HTTP response header is an identifier for a specific version of a resource.
       * It lets caches be more efficient and save bandwidth, as a web server does not need to resend a full response
       * if the content was not changed.
       *
       * See https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/ETag
       * */
      res.setHeader("etag", etag(Buffer.from(JSON.stringify(trophiesByGame))));
      res.setHeader(
        "if-none-match",
        etag(Buffer.from(JSON.stringify(trophiesByGame)))
      );
      const isFreshEtag = isFreshEtagHeader(req, res);

      // Interval in hours to request data from psnApi;
      //TODO Set the diff to 2 hours for prod
      const psnApiPollingInterval = 1000; //hours
      const currentDate = new Date();
      const updatedAt = gameTrophiesExists.updatedAt;

      // Check the "updatedAt" from GameTrophies schema to retrieve new data from psnApi after 2 hours
      const diffHours =
        Math.abs(currentDate.getTime() - updatedAt.getTime()) / 3600000;

      console.log(currentDate, updatedAt);
      console.log(diffHours);

      console.log("isFreshEtag: ", isFreshEtag);

      if (isFreshEtag && diffHours > psnApiPollingInterval) {
        trophiesByGame = await updateDbTrophiesByGame(
          user!._id,
          npCommunicationId,
          trophyTitlePlatform
        );

        // Download and update (if not exists yet) the trophy image (trophyIconUrl)
        // and insert as binary data in the collection "trophiesicons"
        //TODO Update to create trophies icons
        // await createDbGameIconBin(trophiesByGame);

        console.log("updated gameTrophies on DB");
        res.json(trophiesByGame);
      } else if (isFreshEtag && diffHours < psnApiPollingInterval) {
        console.log(
          "Not Modified. You can continue using the same cached version of the response."
        );
        res.status(304).send();
      } else if (!isFreshEtag) {
        console.log("returned gameTrophies from DB");
        res.json(trophiesByGame);
      }
    } else {
      trophiesByGame = await createDbTrophiesByGame(
        user!._id,
        npCommunicationId,
        trophyTitlePlatform
      );
      console.log("created gameTrophies on DB");

      // Download and create (if not exists yet) the trophy image (trophyIconUrl)
      // and insert as binary data in the collection "trophiesicons"
      //TODO Update to create trophies icons
      // await createDbGameIconBin(trophiesByGame);

      res.json(trophiesByGame);
    }
  } catch (error) {
    console.log(error);
  }
};

export { getTrophiesByGame };

//TODO Get the list of trophies info for all games from a user.
//Get the list of trophies info for all games from a user.
// const getAllGamesTrophiesInfo = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   //Validate Request Headers
//   const errors = validationResult(req); // Encontra os erros de validação nesta solicitação e os envolve em um objeto com funções úteis

//   if (!errors.isEmpty()) {
//     res.status(422).json({ errors: errors.array() });
//     return;
//   }

//   const accessToken = getBearerTokenFromHeader(req.headers.authorization);
//   const accountId = req.get("accountid")!;

//   const allGamesTrophiesInfoList = await getAllGamesTrophiesInfoList();

//   res.json(allGamesTrophiesInfoList);
// };
