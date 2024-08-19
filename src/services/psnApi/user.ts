import {
  getProfileFromAccountId,
  getProfileFromUserName,
  makeUniversalSearch,
  ProfileFromAccountIdResponse,
  ProfileFromUserNameResponse,
  SocialAccountResult,
  UniversalSearchResponse,
} from "psn-api";

/**
 * Get the user's accountID.
 *
 * If you search for your own username, it will not be in the list of results.
 * This is a quirk of the universal search API. In cases where you want to use
 * the accountId of the account that's currently logged in, use "me" instead of
 * the standard account ID value.
 *
 * @param acessToken
 * @param psnUsername
 * @returns
 */
export const getPsnAccountIdFromUniversalSearch = async (
  acessToken: string,
  psnUsername: string
): Promise<UniversalSearchResponse<SocialAccountResult>> => {
  const accountId = await makeUniversalSearch(
    { accessToken: acessToken },
    psnUsername,
    "SocialAllAccounts"
  );

  return new Promise((resolve, reject) => {
    try {
      return resolve(accountId);
    } catch (error) {
      return reject(error);
    }
  });
};

/**
 * Get the user's PSN profile by AccountId
 *
 * @param acessToken
 * @param accountId
 * @returns
 */
export const getPsnUserProfileByAccountId = async (
  acessToken: string,
  accountId: string
): Promise<ProfileFromAccountIdResponse> => {
  const userProfile = await getProfileFromAccountId(
    { accessToken: acessToken },
    accountId
  );

  return new Promise((resolve, reject) => {
    try {
      return resolve(userProfile);
    } catch (error) {
      return reject(error);
    }
  });
};

/**
 * Get the user's PSN profile by Username
 *
 * @param acessToken
 * @param psnUsername
 * @returns
 */
export const getPsnUserProfileByUsername = async (
  acessToken: string,
  psnUsername: string
): Promise<ProfileFromUserNameResponse> => {
  const userProfile = await getProfileFromUserName(
    { accessToken: acessToken },
    psnUsername
  );

  return new Promise((resolve, reject) => {
    try {
      return resolve(userProfile);
    } catch (error) {
      return reject(error);
    }
  });
};
