import { Request, Response, NextFunction } from "express";
import { getGameTrophiesInfo } from "../repositories/trophyRepository";
import { validationResult } from "express-validator";
import { getBearerTokenFromHeader } from "../utils/api";

//TODO get req params
//Get the list of trophies info for all games from a user.
const getGameTrophies = async (
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

  const acessToken = getBearerTokenFromHeader(req.headers.authorization);
  const accountId = req.get("accountid")!;

  const trophyTitlePlatform = req.params.trophyTitlePlatform;
  const npCommunicationId = req.params.npCommunicationId;

  const gameTrophiesInfoList = await getGameTrophiesInfo(
    acessToken,
    accountId,
    npCommunicationId,
    trophyTitlePlatform
  );

  res.json(gameTrophiesInfoList);
};

export { getGameTrophies };

//FIXME
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

//   const acessToken = getBearerTokenFromHeader(req.headers.authorization);
//   const accountId = req.get("accountid")!;

//   const allGamesTrophiesInfoList = await getAllGamesTrophiesInfoList();

//   res.json(allGamesTrophiesInfoList);
// };
