import chalk from "chalk";
import { Request, Response } from "express";
import {
  exchangeCodeForAccessToken,
  exchangeNpssoForCode,
  exchangeRefreshTokenForAuthTokens,
} from "psn-api";

import {
  createPsnAuth,
  IPsnAuthTokensResponse,
  PsnAuth,
} from "@/models/classes/psnAuth";

import "dotenv/config";

// const error = chalk.red;
const warning = chalk.yellow;
const info = chalk.green;

const ACCOUNT_ID = process.env.ACCOUNT_ID!;
let PSN_AUTH = new PsnAuth();

/**
 *
 * @param psnAuth
 * @returns
 */
const psnAuthFactory = async (psnAuth: PsnAuth): Promise<PsnAuth> => {
  let iPsnAuthTokensResponse: IPsnAuthTokensResponse | undefined;
  let isAccessTokenExpired = false;

  // We'll take the `expiresIn` value and convert it to an
  // ISO date string (eg- "2021-11-02T01:02:03.246Z").
  // This conversion makes the expiration date easy to store
  // and easy to compare to the current date when used later.
  const now = new Date();
  const expirationDate = new Date(
    now.getTime() + psnAuth.expiresIn * 1000
  ).toISOString();

  // Since `expirationDate` is already an ISO date string,
  // doing a comparison to see if it's expired is a one-liner.
  isAccessTokenExpired = new Date(expirationDate).getTime() < now.getTime();

  if (psnAuth.refreshToken && psnAuth.expiresIn && isAccessTokenExpired) {
    // We'll use our refresh token to get a new access token.
    // Assuming success, this function returns an auth object
    // with the same shape as the response from `exchangeCodeForAccessToken()`.
    console.log(warning("PSN access token is expired!"));
    console.log("Refreshing PSN access token...");
    iPsnAuthTokensResponse = await exchangeRefreshTokenForAuthTokens(
      psnAuth.refreshToken
    );
    psnAuth = createPsnAuth(iPsnAuthTokensResponse, ACCOUNT_ID);
    console.log(info("PSN access token was issued."));
    // Like above, we can now convert `iPsnAuthTokensResponse.expiresIn` to
    // an ISO date string to be ready for a future `isAccessTokenExpired` comparison.
  } else if (!psnAuth.refreshToken || !psnAuth.expiresIn) {
    console.log(warning("No valid PSN access token is active!"));
    console.log("Retrieving PSN access token...");
    iPsnAuthTokensResponse = await authenticatePsn();

    psnAuth = createPsnAuth(iPsnAuthTokensResponse, ACCOUNT_ID);
    console.log(info("PSN access token was issued."));
  } else if (!isAccessTokenExpired) {
    // iPsnAuthTokensResponse = await authenticatePsn();
    console.log(info("Valid PSN access token is active."));
  }

  return new Promise((resolve, reject) => {
    if (!iPsnAuthTokensResponse && isAccessTokenExpired) {
      return reject(new Error("Failed to get PSN access token."));
    }

    return resolve(psnAuth);
  });
};

/**
 *
 * @returns
 */
const getPsnAuthCredentials = async (): Promise<IPsnAuthTokensResponse> => {
  const authCredentials = await authenticatePsn();

  return new Promise((resolve, reject) => {
    if (!authCredentials)
      return reject(new Error("Invalid PSN auth credentials."));

    return resolve(authCredentials);
  });
};

// 1. Authenticate and become authorized with PSN.
const authenticatePsn = async (): Promise<IPsnAuthTokensResponse> => {
  // See the Authenticating Manually docs for how to get your NPSSO.
  const accessCode = await exchangeNpssoForCode(process.env.PSN_NPSSO!);
  const iPsnAuthTokensResponse: IPsnAuthTokensResponse =
    await exchangeCodeForAccessToken(accessCode);

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
    if (!iPsnAuthTokensResponse)
      return reject(new Error("Invalid PSN auth credentials."));

    return resolve(iPsnAuthTokensResponse);
  });
};

/**
 *
 * @param req
 * @param res
 */
export const getPsnAcessTokenByRequest = async (
  req: Request,
  res: Response
) => {
  const auth = await getPsnAuthCredentials();
  if (auth) res.json(auth);
  else res.sendStatus(404);
};

/**
 *
 * @param accessCode
 */
export const refreshAccessTokenWithAccessCode = async (accessCode: string) => {
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
    return updatedAuthorization;
  }
};

psnAuthFactory(PSN_AUTH).then((auth) => (PSN_AUTH = auth));

export { PSN_AUTH, psnAuthFactory };
