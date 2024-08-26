import {
  getProfileFromAccountId,
  getProfileFromUserName,
  makeUniversalSearch,
  ProfileFromAccountIdResponse,
  ProfileFromUserNameResponse,
  SocialAccountResult,
  UniversalSearchResponse,
} from "psn-api";

import { PSN_AUTH } from "@/controllers/authController";
import { PSN_DOMAIN } from "@/models/types/psn";

/**
 * Get the user's accountID.
 *
 * If you search for your own username, it will not be in the list of results.
 * This is a quirk of the universal search API. In cases where you want to use
 * the accountId of the account that's currently logged in, use "me" instead of
 * the standard account ID value.
 *
 * @param acessToken
 * @param psnOnlineId
 * @returns
 */
export const getPsnAccountIdFromUniversalSearch = async (
  psnOnlineId: string
): Promise<UniversalSearchResponse<SocialAccountResult>> => {
  // Get the credentials used by psn_api
  const { accessToken } = await PSN_AUTH.getCredentials();

  const accountId = await makeUniversalSearch(
    { accessToken: accessToken },
    psnOnlineId,
    PSN_DOMAIN.SOCIAL_ALL_ACCOUNTS
  );

  return new Promise((resolve, reject) => {
    try {
      return resolve(accountId);
    } catch (error) {
      console.log(error);
      return reject(new Error(`Error searching PSN Account ID: ${error}`));
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
  accountId: string
): Promise<ProfileFromAccountIdResponse> => {
  // Get the credentials used by psn_api
  const { accessToken } = await PSN_AUTH.getCredentials();

  const userProfile = await getProfileFromAccountId(
    { accessToken: accessToken },
    accountId
  );

  return new Promise((resolve, reject) => {
    try {
      return resolve(userProfile);
    } catch (error: unknown) {
      console.log(error);
      return reject(
        new Error(`Error getting PSN Profile by Account ID: ${error}`)
      );
    }
  });
};

/**
 * Get the user's PSN profile by Username
 *
 * @param acessToken
 * @param psnOnlineId
 * @returns
 */
export const getPsnUserProfileByUsername = async (
  psnOnlineId: string
): Promise<ProfileFromUserNameResponse> => {
  // Get the credentials used by psn_api
  const { accessToken } = await PSN_AUTH.getCredentials();

  const userProfile = await getProfileFromUserName(
    { accessToken: accessToken },
    psnOnlineId
  );

  return new Promise((resolve, reject) => {
    try {
      return resolve(userProfile);
    } catch (error) {
      console.log(error);
      return reject(
        new Error(`Error getting PSN Profile by Online ID: ${error}`)
      );
    }
  });
};
