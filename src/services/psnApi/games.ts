import { getUserTitles, TrophyTitle } from "psn-api";

import { PSN_AUTH } from "@/controllers/authController";
import { PsnApiError } from "@/models/interfaces/common/error";

import { PSN_AUTH2 } from "../loaders/auth/registerLoader";

// Get the user's list of titles (games).
export const getTrophyTitles = async (): Promise<TrophyTitle[]> => {
  // Get the credentials used by psn_api
  const psnAuthInstance = PSN_AUTH ?? PSN_AUTH2;

  const { accessToken, accountId } = await psnAuthInstance.getCredentials();

  const { trophyTitles, totalItemCount } = await getUserTitles(
    { accessToken: accessToken },
    accountId,
    { limit: 150, offset: 0 } //TODO Add limit/offset to query
  );

  console.log(totalItemCount);

  if (!trophyTitles.length)
    throw new PsnApiError("Get trophy titles (games) failed.");

  return trophyTitles;
};
