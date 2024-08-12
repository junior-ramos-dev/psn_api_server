import { Request, Response } from "express";
import { getGameTrophiesInfo } from "../services/psnApi/trophies";

import { psnAuthFactory, PSN_AUTH } from "../services/psnApi/auth";

//TODO Persist on DB and use Etag like gamesList
//Get the list of trophies info for all games from a user.
const getGameTrophies = async (req: Request, res: Response) => {
  //Validate Request Headers
  // const errors = validationResult(req); // Encontra os erros de validação nesta solicitação e os envolve em um objeto com funções úteis

  // if (!errors.isEmpty()) {
  //   res.status(422).json({ errors: errors.array() });
  //   return;
  // }

  //Get and keep PSN access token in memory
  const { accessToken, accountId } = await psnAuthFactory(PSN_AUTH);

  const trophyTitlePlatform = req.params.trophyTitlePlatform;
  const npCommunicationId = req.params.npCommunicationId;

  const gameTrophiesInfoList = await getGameTrophiesInfo(
    accessToken,
    accountId,
    npCommunicationId,
    trophyTitlePlatform
  );

  res.json(gameTrophiesInfoList);
};

export { getGameTrophies };

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
