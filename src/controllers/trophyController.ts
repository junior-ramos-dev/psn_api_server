import { Request, Response } from "express";
import { MongooseError } from "mongoose";

import { IBulkResponse } from "@/models/interfaces/common/bulk";
import { controllersErrorHandler } from "@/models/interfaces/common/error";
import { upsertDbTrophiesForAllGamesBulk } from "@/services/repositories/bulk/trophy";
import {
  getDbEarnedTrophyTypesStats,
  getDbTrophyListByGame,
  updateDbTrophyIsChecked,
} from "@/services/repositories/trophyRepository";

/**
 * Get trophy list by Game ID and Game Platform
 *
 * @param req
 * @param res
 * @returns
 */
const getTrophyListByGame = async (req: Request, res: Response) => {
  try {
    //Get user id from session
    const userId = req.session.user!.id;
    const npCommunicationId = req.params["npCommunicationId"];
    const trophyTitlePlatform = req.params["trophyTitlePlatform"];

    // Return trophies list from db
    const gameTrophies = await getDbTrophyListByGame(
      userId,
      trophyTitlePlatform,
      npCommunicationId
    );

    console.log("returned trophy list by game from DB");
    res.json(gameTrophies);
  } catch (error) {
    console.log(error);
    const resObj = controllersErrorHandler(error);
    res.status(resObj.status).json(resObj);
  }
};

/**
 * Insert or Update the list of trophies for all games from a user (bulk).
 *
 * @param req
 * @param res
 */
const upsertTrophiesForAllGamesBulk = async (req: Request, res: Response) => {
  try {
    //Get user id from session
    const userId = req.session.user!.id;
    const bulkResponse: IBulkResponse<string> = {
      name: "upsertTrophiesForAllGamesBulk",
      message: "",
      data: {},
      isError: false,
    };

    const upsertTrophiesResponse = await upsertDbTrophiesForAllGamesBulk(
      userId,
      bulkResponse
    );

    if (
      upsertTrophiesResponse &&
      !(upsertTrophiesResponse instanceof MongooseError)
    ) {
      if (!upsertTrophiesResponse.isError) {
        res.status(200).send(bulkResponse);
      } else {
        res.status(400).send(bulkResponse);
      }
    }
  } catch (error) {
    console.log(error);
    const resObj = controllersErrorHandler(error);
    res.status(resObj.status).json(resObj);
  }
};

const updateTrophyIsChecked = async (req: Request, res: Response) => {
  try {
    //Get user id from session
    const userId = req.session.user!.id;
    const npCommunicationId = req.params["npCommunicationId"];
    const trophyTitlePlatform = req.params["trophyTitlePlatform"];

    const { trophyGroupId, trophyId, isChecked } = req.body;
    console.log(req.body);

    // Return trophies list from db
    const updated = await updateDbTrophyIsChecked(
      userId,
      npCommunicationId,
      trophyTitlePlatform,
      trophyGroupId,
      trophyId,
      isChecked
    );

    if (updated) {
      console.log(
        `Trophy Updated: trophyId ${trophyId} from [${trophyTitlePlatform} - ${npCommunicationId}] isChecked set to: ${isChecked}`
      );
      res.json({
        message: `Trophy Updated: trophyId ${trophyId} from [${trophyTitlePlatform} - ${npCommunicationId}] isChecked set to: ${isChecked}`,
      });
    } else {
      console.log(
        `Error updating trophy: trophyId ${trophyId} from [${trophyTitlePlatform} - ${npCommunicationId}] isChecked set to: ${isChecked}`
      );
      res.status(400).json({
        message: `Error updating trophy: trophyId ${trophyId} from [${trophyTitlePlatform} - ${npCommunicationId}] isChecked set to: ${isChecked}`,
      });
    }
  } catch (error) {
    console.log(error);
    const resObj = controllersErrorHandler(error);
    res.status(resObj.status).json(resObj);
  }
};

/**
 * Get Earned Trophies Stats
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
    res.status(resObj.status).json(resObj);
  }
};

export {
  getEarnedTrophyTypesStats,
  getTrophyListByGame,
  updateTrophyIsChecked,
  upsertTrophiesForAllGamesBulk,
};
