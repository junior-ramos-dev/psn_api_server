import { servicesErrorHandler } from "@/models/interfaces/common/error";
import { IGameIcon } from "@/models/interfaces/game";
import { GameIcon } from "@/models/schemas/game";
import { IGameIconProjection, IMG_TYPE } from "@/models/types/game";

/**
 * Get the game icon binary data
 *
 * @param npCommunicationId
 * @returns
 */
export const getDbGameIconBin = async (
  npCommunicationId: string
): Promise<IGameIcon | undefined | null> => {
  try {
    const gameIconBin = await GameIcon.findOne({
      npCommunicationId: npCommunicationId,
    });

    return gameIconBin;
  } catch (error: unknown) {
    //Handle the error
    servicesErrorHandler(error);
  }
};

/**
 * Get the game icon binary data by type (PNG/WEBP)
 *
 * @param npCommunicationId
 * @param imgType
 * @returns
 */
export const getDbGameIconBinByImgType = async (
  npCommunicationId: string,
  imgType: string
): Promise<IGameIcon | undefined | null> => {
  try {
    const iconProjection: IGameIconProjection = {
      npCommunicationId: 1,
      trophyTitleName: 1,
      trophyTitleIconUrl: 1,
      iconBinPng: 1,
      iconBinWebp: 1,
      createdAt: 1,
      updatedAt: 1,
    };

    switch (imgType.toLowerCase()) {
      case IMG_TYPE.PNG:
        delete iconProjection.iconBinWebp;
        break;
      case IMG_TYPE.WEBP:
        delete iconProjection.iconBinPng;
        break;
    }

    const gameIconBin = await GameIcon.aggregate([
      // Match the documents by query
      {
        $match: {
          npCommunicationId: npCommunicationId,
        },
      },

      // Project the result.
      {
        $project: iconProjection,
      },
    ]);

    return gameIconBin[0] as IGameIcon;
  } catch (error: unknown) {
    //Handle the error
    servicesErrorHandler(error);
  }
};

/**
 * Get a list of game icon binary data from an array of "npCommunicationId"
 *
 * @param npCommIdList
 * @returns
 */
export const getDbGameIconBinByListOfGamesIds = async (
  npCommIdList: string[],
  imgType: string
): Promise<IGameIcon[] | undefined> => {
  try {
    const iconProjection: IGameIconProjection = {
      npCommunicationId: 1,
      trophyTitleName: 1,
      trophyTitleIconUrl: 1,
      iconBinPng: 1,
      iconBinWebp: 1,
      createdAt: 1,
      updatedAt: 1,
    };

    switch (imgType.toLowerCase()) {
      case IMG_TYPE.PNG:
        delete iconProjection.iconBinWebp;
        break;
      case IMG_TYPE.WEBP:
        delete iconProjection.iconBinPng;
        break;
    }

    const gameIconBinList = await GameIcon.aggregate([
      // Match the documents by query
      {
        $match: {
          npCommunicationId: { $in: [...npCommIdList] },
        },
      },

      // Project the result.
      {
        $project: iconProjection,
      },
    ]);

    return gameIconBinList as IGameIcon[];
  } catch (error: unknown) {
    //Handle the error
    servicesErrorHandler(error);
  }
};
