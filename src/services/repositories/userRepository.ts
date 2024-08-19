import { PSN_AUTH, psnAuthFactory } from "@/services/psnApi/auth";

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
  // psnAuthFactory get and keep PSN access token in memory
  const { accessToken } = await psnAuthFactory(PSN_AUTH);

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
  // psnAuthFactory get and keep PSN access token in memory
  const { accessToken } = await psnAuthFactory(PSN_AUTH);

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
  // psnAuthFactory get and keep PSN access token in memory
  const { accessToken } = await psnAuthFactory(PSN_AUTH);

  const userPsnProfile = await getPsnUserProfileByUsername(
    accessToken,
    psnUsername
  );

  return userPsnProfile;
};
