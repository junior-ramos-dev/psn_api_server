import { Request, Response, NextFunction } from "express";
import { getGameTrophiesStatsForTitles } from "../repositories/trophyRepository";

//Get the list of trophies stats for each of the user's titles.
const getGameTrophiesStats = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const trophiesStatsList = await getGameTrophiesStatsForTitles();

  res.json(trophiesStatsList);
};

export { getGameTrophiesStats };
