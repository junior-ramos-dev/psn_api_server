import { PSN_AUTH } from "@/controllers/authController";

import {
  getPsnAccountIdFromUniversalSearch,
  getPsnUserProfileByAccountId,
  getPsnUserProfileByUsername,
} from "../psnApi/user";

/**
 * Get PSN User AccountId by Username
 *
 * @param psnUsername
 */
export const getPsnAccountIdByUsername = async (psnUsername: string) => {
  // Get the credentials used by psn_api
  const { accessToken } = PSN_AUTH.getCredentials();

  const accountId = await getPsnAccountIdFromUniversalSearch(
    accessToken,
    psnUsername
  );

  return accountId;
};

/**
 * Get Psn Profile By AccountId
 *
 * @param accountId
 * @returns
 */
export const getPsnProfileByAccountId = async (accountId: string) => {
  // Get the credentials used by psn_api
  const { accessToken } = PSN_AUTH.getCredentials();

  const userPsnProfile = await getPsnUserProfileByAccountId(
    accessToken,
    accountId
  );

  return userPsnProfile;
};

/**
 * Get Psn Profile By Username
 *
 * @param psnUsername
 * @returns
 */
export const getPsnProfileByUsername = async (psnUsername: string) => {
  // Get the credentials used by psn_api
  const { accessToken } = PSN_AUTH.getCredentials();

  const userPsnProfile = await getPsnUserProfileByUsername(
    accessToken,
    psnUsername
  );

  return userPsnProfile;
};
