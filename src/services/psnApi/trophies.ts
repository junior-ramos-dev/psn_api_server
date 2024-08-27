import {
  getTitleTrophies,
  getUserTrophiesEarnedForTitle,
  Trophy,
} from "psn-api";
import type { TitleThinTrophy } from "psn-api/dist/models/title-thin-trophy.model";
import { ITrophy } from "src/models/interfaces/trophy";

import { PSN_AUTH } from "@/controllers/authController";
import { PsnApiError } from "@/models/interfaces/common/error";
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
const getPsnGameTrophiesList = async (
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

  if (!gameTrophiesList.length)
    throw new PsnApiError("Get game trohies failed.");

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
const getPsnGameEarnedTrophiesList = async (
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

  if (!gameEarnedTrophies.length)
    throw new PsnApiError("Get game earned trohies failed.");

  return gameEarnedTrophies;
};

/**
 *  Merge the lists for "gameTrophies" and "gameEarnedTrophies" and parse to a list of ITrophy objects
 *
 * @param titleTrophies
 * @param earnedTrophies
 * @returns
 */
const mergePsnTrophyLists = (
  titleTrophies: Trophy[],
  earnedTrophies: Trophy[]
): ITrophy[] => {
  const mergedTrophies: ITrophy[] = [];

  for (const earnedTrophy of earnedTrophies) {
    const foundTitleTrophy = titleTrophies.find(
      (t) => t.trophyId === earnedTrophy.trophyId
    );

    mergedTrophies.push(
      parsePsnTrophyToITrophy({ ...earnedTrophy, ...foundTitleTrophy })
    );
  }

  if (!mergedTrophies.length)
    throw new PsnApiError("Merge game trohies lists failed.");

  return mergedTrophies;
};

const parsePsnTrophyToITrophy = (trophy: Trophy): ITrophy => {
  const nonEarnedDateTime = new Date(0).toISOString();

  const trophyParsed: ITrophy = {
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

  return trophyParsed;
};

/**
 * Get the list of trophies for a single game
 *
 * @param npCommunicationId
 * @param trophyTitlePlatform
 * @param trophyGroupId
 * @returns
 */
export const getPsnGameParsedTrophies = async (
  npCommunicationId: string,
  trophyTitlePlatform: string,
  trophyGroupId?: string
): Promise<ITrophy[]> => {
  // Get the credentials used by psn_api
  const { accessToken, accountId } = await PSN_AUTH.getCredentials();

  const gameTrophies = await getPsnGameTrophiesList(
    accessToken,
    npCommunicationId,
    trophyTitlePlatform,
    trophyGroupId
  );

  const gameEarnedTrophies = await getPsnGameEarnedTrophiesList(
    accessToken,
    accountId,
    npCommunicationId,
    trophyTitlePlatform,
    trophyGroupId
  );

  let parsedTrophies = new Array<ITrophy>();

  if (gameTrophies !== undefined && gameEarnedTrophies !== undefined) {
    parsedTrophies = mergePsnTrophyLists(gameTrophies, gameEarnedTrophies);
  }

  if (!parsedTrophies)
    throw new PsnApiError("Get PSN game parsed trophies failed.");

  return parsedTrophies;
};
