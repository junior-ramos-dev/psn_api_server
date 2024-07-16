import { Request, Response, NextFunction } from "express";
import {
  getGameTrophiesInfo,
  getAllGamesTrophiesInfoList,
} from "../repositories/trophyRepository";

//TODO get req params
//Get the list of trophies info for all games from a user.
// const getGameTrophies = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   const gameTrophiesInfoList = await getGameTrophiesInfo();

//   res.json(gameTrophiesInfoList);
// };

//Get the list of trophies info for all games from a user.
const getAllGamesTrophiesInfo = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const allGamesTrophiesInfoList = await getAllGamesTrophiesInfoList();

  res.json(allGamesTrophiesInfoList);
};

export { getGameTrophiesInfo, getAllGamesTrophiesInfo };
