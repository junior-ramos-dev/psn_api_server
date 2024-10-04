import { Request, Response } from "express";

import { controllersErrorHandler } from "@/models/interfaces/common/error";
import {
  getDbGameIconBin,
  getDbGameIconBinByImgType,
  getDbGameIconBinByListOfGamesIds,
} from "@/services/repositories/gameIconRepository";

/**
 * Get the icon (image) binary data from a game id (npCommunicationId)
 *
 * @param req
 * @param res
 * @returns
 */
export const getGameIconBin = async (req: Request, res: Response) => {
  try {
    const npCommunicationId = req.params["npCommunicationId"];

    const gameIconBin = await getDbGameIconBin(npCommunicationId);

    res.json(gameIconBin);
  } catch (error) {
    console.log(error);
    const resObj = controllersErrorHandler(error);
    return res.status(resObj.status).json(resObj);
  }
};

/**
 * Get the PNG or WEBP icon (image) binary data from a game id (npCommunicationId)
 *
 * @param req
 * @param res
 * @returns
 */
export const getGameIconBinByImgType = async (req: Request, res: Response) => {
  try {
    const npCommunicationId = req.params["npCommunicationId"];
    const imgType = req.params["imgType"];

    const gameIconBin = await getDbGameIconBinByImgType(
      npCommunicationId,
      imgType
    );

    res.json(gameIconBin);
  } catch (error) {
    console.log(error);
    const resObj = controllersErrorHandler(error);
    return res.status(resObj.status).json(resObj);
  }
};

/**
 * Get the icon (image) binary data from a list of game ids (npCommunicationId)
 *
 * @param req
 * @param res
 */
export const getGamesIconBinListByIds = async (req: Request, res: Response) => {
  try {
    const { npCommIdList, imgType } = req.body;
    const gameIconBin = await getDbGameIconBinByListOfGamesIds(
      npCommIdList,
      imgType
    );

    res.json(gameIconBin);
  } catch (error) {
    console.log(error);
    const resObj = controllersErrorHandler(error);
    return res.status(resObj.status).json(resObj);
  }
};
