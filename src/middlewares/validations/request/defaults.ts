import { header } from "express-validator";

const authBearerHeader = [
  header("authorization")
    .exists({ values: "undefined" })
    .withMessage("Missing Authorization Header") // specify the message to show if a validation has failed
    .bail() // not necessary, but it stops execution if previous validation failed
    .contains("Bearer")
    .withMessage("Authorization Token is not Bearer"),
];

const etagHeader = [
  header("etag").exists().withMessage("Missing 'ETag' Header").bail(),
  header("if-none-match")
    .exists()
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
