import _ from "lodash";
import {
  getTitleTrophies,
  getTitleTrophyGroups,
  getUserTrophiesEarnedForTitle,
  getUserTrophyGroupEarningsForTitle,
  Trophy,
  UserTrophyGroupEarningsForTitleResponse,
} from "psn-api";
import type { TitleThinTrophy } from "psn-api/dist/models/title-thin-trophy.model";

import { PSN_AUTH } from "@/controllers/authController";
import { PsnApiError } from "@/models/interfaces/common/error";
import { ITrophy } from "@/models/interfaces/trophy";
import {
  ConvertTrophyDefinedGroupsResponse,
  IGameTrophyGroups,
  ITrophyDefinedGroupsResponse,
  ITrophyGroupsInfo,
} from "@/models/interfaces/trophyGroups";
import {
  NP_SERVICE_NAME,
  TROPHY_GROUP_ID,
  TROPHY_TITLE_PLATFORM,
} from "@/models/types/game";
import {
  CAPITALIZE_TYPE_MAP,
  TROPHY_POINTS_MAP,
  TROPHY_RARITY_MAP,
} from "@/models/types/trophy";

import { PSN_AUTH2 } from "../loaders/auth/registerLoader";

/**
 * Get game trophy groups
 *
 * @param npCommunicationId
 * @param trophyTitlePlatform
 * @returns
 */
const getPsnGameDefinedTrophyGroups = async (
  npCommunicationId: string,
  trophyTitlePlatform: string
): Promise<ITrophyDefinedGroupsResponse> => {
  const psnAuthInstance = PSN_AUTH ?? PSN_AUTH2;
  const { accessToken } = await psnAuthInstance.getCredentials();

  const data = await getTitleTrophyGroups(
    { accessToken: accessToken },
    npCommunicationId,
    {
      npServiceName: !trophyTitlePlatform.includes(TROPHY_TITLE_PLATFORM.PS5)
        ? NP_SERVICE_NAME.PS3_PS4_PSVITA_TROPHY
        : NP_SERVICE_NAME.PS5_TROPHY,
    }
  );

  if (!data) throw new PsnApiError("Get game trophy groups failed.");

  const definedGroupsResponse = ConvertTrophyDefinedGroupsResponse.fromJson(
    JSON.stringify(data)
  );

  return definedGroupsResponse;
};

/**
 * Get the game earned trophy groups.
 *
 * @param npCommunicationId
 * @param trophyTitlePlatform
 * @returns
 */
const getPsnGameEarnedTrophiesGroups = async (
  npCommunicationId: string,
  trophyTitlePlatform: string
): Promise<UserTrophyGroupEarningsForTitleResponse> => {
  const psnAuthInstance = PSN_AUTH ?? PSN_AUTH2;
  const { accessToken, accountId } = await psnAuthInstance.getCredentials();

  const data = await getUserTrophyGroupEarningsForTitle(
    { accessToken: accessToken },
    accountId,
    npCommunicationId,
    {
      npServiceName: !trophyTitlePlatform.includes(TROPHY_TITLE_PLATFORM.PS5)
        ? NP_SERVICE_NAME.PS3_PS4_PSVITA_TROPHY
        : NP_SERVICE_NAME.PS5_TROPHY,
    }
  );

  if (!data) throw new PsnApiError("Get game trophy groups failed.");

  return data;
};

/**
 * Get PSN trophies groups by game ID and game Platform
 *
 * @param npCommunicationId
 * @param trophyTitlePlatform
 * @returns
 */
export const getPsnParsedTrophiesGroupsByGame = async (
  npCommunicationId: string,
  trophyTitlePlatform: string
) => {
  try {
    // Get the credentials used by psn_api
    const psnAuthInstance = PSN_AUTH ?? PSN_AUTH2;
    const { accessToken, accountId } = await psnAuthInstance.getCredentials();

    // Get defined trophy groups
    const definedGroups = await getPsnGameDefinedTrophyGroups(
      npCommunicationId,
      trophyTitlePlatform
    );

    // Get earned trophy groups
    const earnedGroups = await getPsnGameEarnedTrophiesGroups(
      npCommunicationId,
      trophyTitlePlatform
    );

    const gameTrophyGroups: IGameTrophyGroups = {
      allTrophiesCount: definedGroups.definedTrophies,
      trophyGroupsInfo: [],
    };

    const trophiesGroupsInfoArray: ITrophyGroupsInfo[] = [];

    if (definedGroups && earnedGroups) {
      const groupsIds: string[] = [];

      // Get the groups IDs
      for (const group of definedGroups.trophyGroups) {
        groupsIds.push(group.trophyGroupId);
      }

      let count = 0;

      // Get the trophy list for each group
      for (const groupId of groupsIds) {
        const definedTrophiesGroup = await getPsnGameTrophiesList(
          accessToken,
          npCommunicationId,
          trophyTitlePlatform,
          groupId
        );

        const earnedTrophiesGroup = await getPsnGameEarnedTrophiesList(
          accessToken,
          accountId,
          npCommunicationId,
          trophyTitlePlatform,
          groupId
        );

        // Merge the trophy lists for each group
        let parsedTrophies = mergePsnTrophyLists(
          definedTrophiesGroup,
          earnedTrophiesGroup
        );

        parsedTrophies = _.orderBy(
          parsedTrophies,
          ["trophyId", "groupId"],
          ["asc", "asc"]
        );

        // Create the trophy groups info with the merged trophy lists
        const trophiesGroupsInfo: ITrophyGroupsInfo = {
          trophyGroupId: definedGroups.trophyGroups[count].trophyGroupId,
          definedGroupInfo: definedGroups.trophyGroups[count],
          earnedGroupInfo: earnedGroups.trophyGroups[count],
          groupTrophies: parsedTrophies,
        };

        trophiesGroupsInfoArray.push(trophiesGroupsInfo);
        count++;
      }
    }

    gameTrophyGroups.trophyGroupsInfo = trophiesGroupsInfoArray;

    return gameTrophyGroups;
  } catch (error) {
    //Handle the error
    throw new PsnApiError(`Get PSN trophies groups by game failed: ${error}`);
  }
};

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
    throw new PsnApiError("Get game trophies failed.");

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
    throw new PsnApiError("Get game earned trophies failed.");

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
    throw new PsnApiError("Merge game trophies lists failed.");

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
    rarity: TROPHY_RARITY_MAP[trophy.trophyRare ?? 0],
    groupId: trophy.trophyGroupId,
    points: TROPHY_POINTS_MAP[trophy.trophyType ?? 0],
    isChecked: trophy.earned,
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
  const psnAuthInstance = PSN_AUTH ?? PSN_AUTH2;
  const { accessToken, accountId } = await psnAuthInstance.getCredentials();

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
