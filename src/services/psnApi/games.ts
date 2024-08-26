import { getUserTitles, TrophyTitle } from "psn-api";

import { PSN_AUTH } from "@/controllers/authController";

// Get the user's list of titles (games).
export const getTrophyTitles = async (): Promise<TrophyTitle[]> => {
  // Get the credentials used by psn_api
  const { accessToken, accountId } = await PSN_AUTH.getCredentials();

  const { trophyTitles } = await getUserTitles(
    { accessToken: accessToken },
    accountId,
    { limit: 150 }
  );

  return new Promise((resolve, reject) => {
    try {
      return resolve(trophyTitles);
    } catch (error) {
      return reject(error);
    }
  });
};
