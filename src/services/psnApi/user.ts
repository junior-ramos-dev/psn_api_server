import { getProfileFromUserName, ProfileFromUserNameResponse } from "psn-api";

import { PSN_AUTH } from "@/controllers/authController";
import { PsnApiError } from "@/models/interfaces/common/error";

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

  if (!userProfile)
    throw new PsnApiError("Getting PSN Profile by Online ID failed.");

  return userProfile;
};
