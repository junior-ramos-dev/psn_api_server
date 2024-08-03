import { getUserTitles, TrophyTitle } from "psn-api";

// Get the user's list of titles (games).
export const getTrophyTitles = async (
  acessToken: string,
  accountId: string
): Promise<TrophyTitle[]> => {
  const { trophyTitles } = await getUserTitles(
    { accessToken: acessToken },
    accountId,
    { limit: 150 }
  );

  return new Promise((resolve, reject) => {
    return resolve(trophyTitles);
  });
};
