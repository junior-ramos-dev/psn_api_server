import "dotenv/config";
import { Auth } from "../models/auth";

import {
  exchangeCodeForAccessToken,
  exchangeNpssoForCode,
  exchangeRefreshTokenForAuthTokens,
} from "psn-api";
import PsnAuthorization from "../models/psnAuthorization";

async function getAuthCredentials(): Promise<Auth> {
  const authCredentials = await authenticatePsn();

  return new Promise((resolve, reject) => {
    if (!authCredentials) return reject(new Error(`Invalid auth credentials.`));

    return resolve(authCredentials);
  });
}

// 1. Authenticate and become authorized with PSN.
async function authenticatePsn(): Promise<Auth> {
  // See the Authenticating Manually docs for how to get your NPSSO.
  const accessCode = await exchangeNpssoForCode(process.env.PSN_NPSSO!);
  const psnAuth = await exchangeCodeForAccessToken(accessCode);

  //FIXME Move to frontend request
  const accountId = process.env.ACCOUNT_ID!;

  // 2. Get the user's `accountId` from the username.
  // For personal use set accountId as "me" instead.
  /* ##### 
  const allAccountsSearchResults = await makeUniversalSearch(
    authorization,
    process.env.PSN_USERNAME!,
    "SocialAllAccounts"
  );
  ##### */

  // 3. The accoutId is used to retrieve different accounts.
  // For personal use set accountId as "me" instead.
  /* ##### 
  const accountId =
    allAccountsSearchResults.domainResponses[0].results[0].socialMetadata
      .accountId;
  ##### */

  return new Promise((resolve, reject) => {
    if (!psnAuth || !accountId)
      return reject(new Error(`Invalid auth credentials.`));

    const psnAuthorization = new PsnAuthorization(
      psnAuth.accessToken,
      psnAuth.expiresIn,
      psnAuth.idToken,
      psnAuth.refreshToken,
      psnAuth.refreshTokenExpiresIn,
      psnAuth.scope,
      psnAuth.tokenType
    );

    const authorization = new Auth(psnAuthorization, accountId);

    return resolve(authorization);
  });
}

async function refreshAccessToken(accessCode: string) {
  // We're going to be working with the authorization object
  // returned from this function we used when we first authenticated.
  const authorization = await exchangeCodeForAccessToken(accessCode);

  // We'll take the `expiresIn` value and convert it to an
  // ISO date string (eg- "2021-11-02T01:02:03.246Z").
  // This conversion makes the expiration date easy to store
  // and easy to compare to the current date when used later.
  const now = new Date();
  const expirationDate = new Date(
    now.getTime() + authorization.expiresIn * 1000
  ).toISOString();

  // Since `expirationDate` is already an ISO date string,
  // doing a comparison to see if it's expired is a one-liner.
  const isAccessTokenExpired =
    new Date(expirationDate).getTime() < now.getTime();

  if (isAccessTokenExpired) {
    // We'll use our refresh token to get a new access token.
    // Assuming success, this function returns an auth object
    // with the same shape as the response from `exchangeCodeForAccessToken()`.
    const updatedAuthorization = await exchangeRefreshTokenForAuthTokens(
      authorization.refreshToken
    );

    // Like above, we can now convert `updatedAuthorization.expiresIn` to
    // an ISO date string to be ready for a future `isAccessTokenExpired` comparison.
  }
}

export { getAuthCredentials, refreshAccessToken };
