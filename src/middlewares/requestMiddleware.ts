import { header } from "express-validator";

export enum REQUEST_PROPERTY {
  AUTH_HEADERS = "authHeaders",
  HEADERS = "headers",
  BODY = "body",
  PARAMS = "params",
}

// the validator middleware will have already thrown a 403 if the header was missing,
// so you can be 100% sure that the header is present with validations you created.
export const validateReq = (method: REQUEST_PROPERTY) => {
  switch (method) {
    case REQUEST_PROPERTY.AUTH_HEADERS: {
      return validateAuthHeaders;
    }
    case REQUEST_PROPERTY.HEADERS: {
      return validateHeaders;
    }
    // case REQUEST_PROPERTY.BODY: {
    //   return;
    // }
    // case REQUEST_PROPERTY.PARAMS: {
    //   return;
    // }
    default:
      return validateHeaders;
  }
};

const validateAuthHeaders = [
  header("authorization")
    .exists({ values: "undefined" })
    .withMessage("Missing Authorization Header")
    .bail()
    .contains("Bearer")
    .withMessage("Authorization Token is not Bearer"),
];

const validateHeaders = [
  header("etag")
    .exists({ values: "undefined" })
    .withMessage("Missing 'ETag' Header") // you can specify the message to show if a validation has failed
    .bail(), // not necessary, but it stops execution if previous validation failed
  header("if-none-match")
    .exists({ values: "undefined" })
    .withMessage("Missing 'If-None-Match' Header")
    .bail(),
  // header("authorization")
  //   .exists({ values: "undefined" })
  //   .withMessage("Missing Authorization Header")
  //   .bail()
  //   .contains("Bearer")
  //   .withMessage("Authorization Token is not Bearer"),
];
