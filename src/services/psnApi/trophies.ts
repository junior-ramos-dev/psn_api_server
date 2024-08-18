import {
  getTitleTrophies,
  getUserTrophiesEarnedForTitle,
  Trophy,
} from "psn-api";
import type { TitleThinTrophy } from "psn-api/dist/models/title-thin-trophy.model";
import { ITrophy } from "src/models/interfaces/trophy";

import {
  NP_SERVICE_NAME,
  TROPHY_GROUP_ID,
  TROPHY_TITLE_PLATFORM,
} from "@/models/types/game";
import {
  CAPITALIZE_TYPE_MAP,
  POINTS_MAP,
  RARITY_MAP,
} from "@/models/types/trophy";

/**
 * Get the game trophies list.
 *
 * @param accessToken
 * @param npCommunicationId
 * @param trophyTitlePlatform
 * @param trophyGroupId
 * @returns
 */
const getGameTrophiesList = async (
  accessToken: string,
  npCommunicationId: string,
  trophyTitlePlatform: string,
  trophyGroupId?: string
): Promise<TitleThinTrophy[]> => {
  const { trophies: gameTrophiesList } = await getTitleTrophies(
    { accessToken: accessToken },
    npCommunicationId,
    trophyGroupId ?? TROPHY_GROUP_ID.ALL,
    {
      npServiceName: !trophyTitlePlatform.includes(TROPHY_TITLE_PLATFORM.PS5)
        ? NP_SERVICE_NAME.PS3_PS4_PSVITA_TROPHY
        : NP_SERVICE_NAME.PS5_TROPHY,
    }
  );

  return gameTrophiesList;
};

/**
 * Get the list of earned trophies for each of the user's titles.
 *
 * @param accessToken
 * @param accountId
 * @param npCommunicationId
 * @param trophyTitlePlatform
 * @param trophyGroupId
 * @returns
 */
const getGameTrophiesEarnedList = async (
  accessToken: string,
  accountId: string,
  npCommunicationId: string,
  trophyTitlePlatform: string,
  trophyGroupId?: string
): Promise<TitleThinTrophy[]> => {
  const { trophies: gameEarnedTrophies } = await getUserTrophiesEarnedForTitle(
    { accessToken: accessToken },
    accountId,
    npCommunicationId,
    trophyGroupId ?? TROPHY_GROUP_ID.ALL,
    {
      npServiceName: !trophyTitlePlatform.includes(TROPHY_TITLE_PLATFORM.PS5)
        ? NP_SERVICE_NAME.PS3_PS4_PSVITA_TROPHY
        : NP_SERVICE_NAME.PS5_TROPHY,
    }
  );
  return gameEarnedTrophies;
};

/**
 * Get the list of trophies info for a single game
 *
 * @param accessToken
 * @param accountId
 * @param npCommunicationId
 * @param trophyTitlePlatform
 * @param trophyGroupId
 * @returns
 */
const getGameTrophiesInfo = async (
  accessToken: string,
  accountId: string,
  npCommunicationId: string,
  trophyTitlePlatform: string,
  trophyGroupId?: string
): Promise<ITrophy[]> => {
  const gameTrophies = await getGameTrophiesList(
    accessToken,
    npCommunicationId,
    trophyTitlePlatform,
    trophyGroupId
  );

  const gameEarnedTrophies = await getGameTrophiesEarnedList(
    accessToken,
    accountId,
    npCommunicationId,
    trophyTitlePlatform,
    trophyGroupId
  );

  let mergedTrophies = new Array<ITrophy>();

  if (gameTrophies !== undefined && gameEarnedTrophies !== undefined) {
    mergedTrophies = mergeTrophyLists(gameTrophies, gameEarnedTrophies);
  }
  return new Promise((resolve, reject) => {
    try {
      return resolve(mergedTrophies);
    } catch (error) {
      return reject(error);
    }
  });
};

/**
 *  Merge the lists for "gameTrophies" and "gameEarnedTrophies" and parse to a list of ITrophy objects
 *
 * @param titleTrophies
 * @param earnedTrophies
 * @returns
 */
const mergeTrophyLists = (
  titleTrophies: Trophy[],
  earnedTrophies: Trophy[]
) => {
  const mergedTrophies: ITrophy[] = [];

  for (const earnedTrophy of earnedTrophies) {
    const foundTitleTrophy = titleTrophies.find(
      (t) => t.trophyId === earnedTrophy.trophyId
    );

    mergedTrophies.push(
      normalizeTrophy({ ...earnedTrophy, ...foundTitleTrophy })
    );
  }

  return mergedTrophies;
};

const normalizeTrophy = (trophy: Trophy) => {
  const nonEarnedDateTime = new Date(0).toISOString();

  const trophyNormalized: ITrophy = {
    trophyId: trophy.trophyId,
    trophyHidden: trophy.trophyHidden,
    isEarned: trophy.earned,
    isEarnedDateTime: trophy.earned ? trophy.earnedDateTime : nonEarnedDateTime,
    trophyType: CAPITALIZE_TYPE_MAP[trophy.trophyType ?? trophy.trophyType],
    trophyRare: trophy.trophyRare,
    trophyEarnedRate: Number(trophy.trophyEarnedRate),
    trophyName: trophy.trophyName,
    trophyDetail: trophy.trophyDetail,
    trophyIconUrl: trophy.trophyIconUrl,
    trophyGroupId: trophy.trophyGroupId,
    rarity: RARITY_MAP[trophy.trophyRare ?? 0],
    groupId: trophy.trophyGroupId,
    points: POINTS_MAP[trophy.trophyType ?? 0],
  };

  return trophyNormalized;
};

export { getGameTrophiesInfo };
