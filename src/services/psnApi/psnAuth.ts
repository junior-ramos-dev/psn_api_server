import chalk from "chalk";
import {
  exchangeCodeForAccessToken,
  exchangeNpssoForCode,
  exchangeRefreshTokenForAuthTokens,
} from "psn-api";

import { PsnApiError } from "@/models/interfaces/common/error";

import "dotenv/config";

const logError = chalk.red;
const warning = chalk.yellow;
const info = chalk.green;

// When querying the titles associated with yourself (the authentication context),
// the numeric accountId can be substituted with "me".
// To find a user's accountId, the makeUniversalSearch() function can be used.
const ACCOUNT_ID = "me";

/**
 *
 */
type PsnAuthTokensResponse = {
  /** Used to retrieve data from the PSN API. */
  accessToken: string;
  /** When the access token will expire. */
  expiresIn: number;
  idToken: string;
  /** Used to retrieve a new access token when it expires. */
  refreshToken: string;
  /** When the refresh token will expire. */
  refreshTokenExpiresIn: number;
  scope: string;
  tokenType: string;
};

/**
 *
 */
export type PsnApiCredentials = {
  accessToken: string;
  accountId: string;
};

/**
 *
 */
export class PsnAuth {
  private npsso: string;
  private accountId: string = ACCOUNT_ID;
  private psnAuthTokensResponse: PsnAuthTokensResponse = {
    accessToken: "",
    expiresIn: 0,
    idToken: "",
    refreshToken: "",
    refreshTokenExpiresIn: 0,
    scope: "",
    tokenType: "",
  };
  private tokenCreatedAt = new Date();
  private isAccessTokenExpired = false;
  private hasAccessToken = false;

  constructor(npsso: string) {
    this.npsso = npsso;
  }

  /**
   * Get the credentials used by psn_api
   *
   * @returns `PsnApiCredentials`
   */
  getCredentials = async (): Promise<PsnApiCredentials> => {
    if (this.accessTokenHasExpired()) {
      await this.psnAuthFactory();
    }
    const psnApiCredentials: PsnApiCredentials = {
      accessToken: this.psnAuthTokensResponse.accessToken,
      accountId: this.accountId,
    };

    return psnApiCredentials;
  };

  /**
   * Check if the accessToken has expired
   *
   * @returns boolean
   */
  private accessTokenHasExpired = (): boolean => {
    // We'll take the `expiresIn` value and convert it to an ISO date string (eg- "2021-11-02T01:02:03.246Z").
    // This conversion makes the expiration date easy to store and easy to compare to the current date when used later.
    const expirationDate = new Date(
      this.tokenCreatedAt.getTime() +
        this.psnAuthTokensResponse.expiresIn * 1000
    ).toISOString();

    // Since `expirationDate` is already an ISO date string, doing a comparison to see if it's expired is a one-liner.
    this.isAccessTokenExpired =
      new Date(expirationDate).getTime() < this.tokenCreatedAt.getTime();

    return this.isAccessTokenExpired;
  };

  /**
   * Create or refresh the accessToken
   *
   * @returns Promise<PsnAuth>
   */
  private psnAuthFactory = async (): Promise<PsnAuth> => {
    try {
      if (
        this.psnAuthTokensResponse.refreshToken &&
        this.psnAuthTokensResponse.expiresIn &&
        this.isAccessTokenExpired
      ) {
        // We'll use our refresh token to get a new access token.
        // Assuming success, this function returns an auth object
        // with the same shape as the response from `exchangeCodeForAccessToken()`.
        console.log(warning("PSN access token is expired!"));
        console.log("Refreshing PSN access token...");
        this.psnAuthTokensResponse = await exchangeRefreshTokenForAuthTokens(
          this.psnAuthTokensResponse.refreshToken
        );

        console.log(info("PSN access token was issued."));

        this.hasAccessToken = true;
        this.tokenCreatedAt = new Date();
        // Like above, we can now convert `this.psnAuthTokensResponse.expiresIn` to
        // an ISO date string to be ready for a future `isAccessTokenExpired` comparison.
      } else if (
        !this.psnAuthTokensResponse.refreshToken ||
        !this.psnAuthTokensResponse.expiresIn
      ) {
        console.log(warning("No valid PSN access token is active!"));
        console.log("Retrieving PSN access token...");

        this.psnAuthTokensResponse = await authenticatePsn(this.npsso);

        console.log(info("PSN access token was issued."));
        this.hasAccessToken = true;
        this.tokenCreatedAt = new Date();
      } else if (!this.isAccessTokenExpired) {
        console.log(info("Valid PSN access token is active."));
      } else if (
        !this.psnAuthTokensResponse.accessToken &&
        this.isAccessTokenExpired
      ) {
        throw new PsnApiError("Get PSN access token failed.");
      }
    } catch (error) {
      console.log(logError("psnAuthFactory", String(error)));
      throw new PsnApiError(String(error));
    }

    return this;
  };

  /**
   * Create a PsnAuth instance
   *
   * @param npsso
   * @returns Promise<PsnAuth>
   */
  static readonly createPsnAuth = async (npsso: string): Promise<PsnAuth> => {
    return await new PsnAuth(npsso).psnAuthFactory().then((psnAuth) => psnAuth);
  };

  /**
   * Clear the PsnAuth instance
   *
   * @param psnAuth
   * @returns
   */
  static readonly clearPsnAuth = (psnAuth: PsnAuth): PsnAuth => {
    psnAuth.npsso = "";
    psnAuth.accountId = "";
    psnAuth.psnAuthTokensResponse = {
      accessToken: "",
      expiresIn: 0,
      idToken: "",
      refreshToken: "",
      refreshTokenExpiresIn: 0,
      scope: "",
      tokenType: "",
    };
    psnAuth.hasAccessToken = false;
    psnAuth.tokenCreatedAt = new Date(0);
    psnAuth.isAccessTokenExpired = false;

    return psnAuth;
  };

  /**
   * Create a PsnAuth instance
   *
   * @param npsso
   * @returns Promise<PsnAuth>
   */
  static readonly isAccessTokenIssued = (psnAuth: PsnAuth): PsnAuth => {
    return psnAuth.hasAccessToken ? psnAuth : new PsnAuth("");
  };
}

/**
 * Authenticate and become authorized with PSN
 *
 * @param npsso
 * @returns
 */
const authenticatePsn = async (
  npsso: string
): Promise<PsnAuthTokensResponse> => {
  // 1. Authenticate and become authorized with PSN.
  // See the Authenticating Manually docs for how to get your NPSSO.
  const accessCode = await exchangeNpssoForCode(npsso);
  const iPsnAuthTokensResponse: PsnAuthTokensResponse =
    await exchangeCodeForAccessToken(accessCode);

  // 2. Get the user's `accountId` from the username.
  // For personal use set accountId as "me" instead.
  /* ----------------------------------------------------------------------- 
  const allAccountsSearchResults = await makeUniversalSearch(
    authorization,
    process.env.PSN_USERNAME!,
    PSN_DOMAIN.SOCIAL_ALL_ACCOUNTS
  );
  ----------------------------------------------------------------------- */

  // 3. The accoutId is used to retrieve different accounts.
  // For personal use set accountId as "me" instead.
  /* ----------------------------------------------------------------------- 
  const accountId =
    allAccountsSearchResults.domainResponses[0].results[0].socialMetadata
      .accountId;
  ----------------------------------------------------------------------- */

  if (!iPsnAuthTokensResponse)
    throw new PsnApiError("Exchange code for accessToken failed.");

  return iPsnAuthTokensResponse;
};
