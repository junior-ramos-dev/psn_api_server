interface IPsnAuth {
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
  //User accountId
  accountId: string;
}

export type IPsnAuthTokensResponse = Omit<IPsnAuth, "accountId">;

export class PsnAuth implements IPsnAuth {
  accessToken: string;
  expiresIn: number;
  idToken: string;
  refreshToken: string;
  refreshTokenExpiresIn: number;
  scope: string;
  tokenType: string;
  accountId: string;

  constructor(
    accessToken: string = "",
    expiresIn: number = 0,
    idToken: string = "",
    refreshToken: string = "",
    refreshTokenExpiresIn: number = 0,
    scope: string = "",
    tokenType: string = "",
    accountId: string = ""
  ) {
    (this.accessToken = accessToken),
      (this.expiresIn = expiresIn),
      (this.idToken = idToken),
      (this.refreshToken = refreshToken),
      (this.refreshTokenExpiresIn = refreshTokenExpiresIn),
      (this.scope = scope),
      (this.tokenType = tokenType),
      (this.accountId = accountId);
  }
}

export const createPsnAuth = (
  iPsnAuthTokensResponse: IPsnAuthTokensResponse,
  accountId: string
): PsnAuth => {
  return new PsnAuth(
    iPsnAuthTokensResponse.accessToken,
    iPsnAuthTokensResponse.expiresIn,
    iPsnAuthTokensResponse.idToken,
    iPsnAuthTokensResponse.refreshToken,
    iPsnAuthTokensResponse.refreshTokenExpiresIn,
    iPsnAuthTokensResponse.scope,
    iPsnAuthTokensResponse.tokenType,
    accountId
  );
};
