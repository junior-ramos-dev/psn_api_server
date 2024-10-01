import { Request, Response } from "express";

import { controllersErrorHandler } from "@/models/interfaces/common/error";
import { getDbEarnedTrophyTypesStats } from "@/services/repositories/stats/trophyStats";

/**
 * Get the icon (image) binary data from a list of game ids (npCommunicationId)
 *
 * @param req
 * @param res
 */
const getEarnedTrophyTypesStats = async (req: Request, res: Response) => {
  try {
    //Get user id from session
    const userId = req.session.user!.id;
    const { startDate, endDate } = req.body;
    const gamesAndTrophyGroups = await getDbEarnedTrophyTypesStats(
      userId,
      startDate,
      endDate
    );

    res.json(gamesAndTrophyGroups);
  } catch (error) {
    console.log(error);
    const resObj = controllersErrorHandler(error);
    return res.status(resObj.status).json(resObj);
  }
};

export { getEarnedTrophyTypesStats };
