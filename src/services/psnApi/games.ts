import { getUserTitles, TrophyTitle } from "psn-api";

import { PSN_AUTH } from "@/controllers/authController";
import { PsnApiError } from "@/models/interfaces/common/error";

import { PSN_AUTH2 } from "../loaders/auth/registerLoader";

/**
 * Get the user's list of titles (games).
 *
 * @param limit
 * @param offset
 * @returns
 */
export const getTrophyTitles = async (
  limit?: number,
  offset?: number
): Promise<TrophyTitle[]> => {
  // Get the credentials used by psn_api
  const psnAuthInstance = PSN_AUTH ?? PSN_AUTH2;

  const { accessToken, accountId } = await psnAuthInstance.getCredentials();

  //TODO Return totalItemCount, nextOffset, previousOffset
  const { trophyTitles /* totalItemCount, nextOffset, previousOffset */ } =
    await getUserTitles({ accessToken: accessToken }, accountId, {
      limit: limit ?? 500,
      offset: offset ?? 0,
    });

  if (!trophyTitles.length)
    throw new PsnApiError("Get trophy titles (games) failed.");

  return trophyTitles;
};
