import { header } from "express-validator";

const authBearerHeader = [
  header("authorization")
    .exists({ values: "undefined" })
    .withMessage("Missing Authorization Header")
    .bail()
    .contains("Bearer")
    .withMessage("Authorization Token is not Bearer"),
];

const etagHeader = [
  header("etag")
    .exists({ values: "undefined" })
    .withMessage("Missing 'ETag' Header") // you can specify the message to show if a validation has failed
    .bail(), // not necessary, but it stops execution if previous validation failed
  header("if-none-match")
    .exists({ values: "undefined" })
    .withMessage("Missing 'If-None-Match' Header")
    .bail(),
];

/**
 * Request validation for enpoints using Authorization header
 *
 * @returns
 */
export const validateAuthBearerHeader = () => {
  return authBearerHeader;
};

/**
 * Request validation for enpoints using ETag header
 *
 * @returns
 */
export const validateEtagHeader = () => {
  return etagHeader;
};
