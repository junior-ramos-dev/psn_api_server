export default class PsnAuthorization {
  accessToken: string;
  expiresIn: number;
  idToken: string;
  refreshToken: string;
  refreshTokenExpiresIn: number;
  scope: string;
  tokenType: string;

  constructor(
    accessToken: string,
    expiresIn: number,
    idToken: string,
    refreshToken: string,
    refreshTokenExpiresIn: number,
    scope: string,
    tokenType: string
  ) {
    this.accessToken = accessToken;
    this.expiresIn = expiresIn;
    this.idToken = idToken;
    this.refreshToken = refreshToken;
    this.refreshTokenExpiresIn = refreshTokenExpiresIn;
    this.scope = scope;
    this.tokenType = tokenType;
  }
}
