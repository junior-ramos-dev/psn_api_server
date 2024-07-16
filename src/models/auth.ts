import PsnAuthorization from "./psnAuthorization";

export class Auth {
  psnAuthorization: PsnAuthorization;
  accountId: string;

  constructor(psnAuthorization: PsnAuthorization, accountId: string) {
    this.psnAuthorization = psnAuthorization;
    this.accountId = accountId;
  }
}
