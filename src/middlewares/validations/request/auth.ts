import { body } from "express-validator";
import _ from "lodash";

import { validateAuthBearerHeader } from "./defaults";

const loginBody = [
  body("email")
    .notEmpty()
    .exists({ values: "undefined" })
    .withMessage("Missing 'email' field")
    .bail()
    .isEmail()
    .bail(),
  body("password")
    .notEmpty()
    .exists({ values: "undefined" })
    .withMessage("Missing 'password' field")
    .bail(),
];

const registerBody = _.concat(
  [
    body("psnOnlineId")
      .notEmpty()
      .exists({ values: "undefined" })
      .withMessage("Missing 'psnOnlineId' field")
      .bail(),
  ],
  loginBody
);

/**
 * Request validation for 'register' endpoint request
 *
 * @returns
 */
export const validateRegisterReq = () => {
  return _.concat(validateAuthBearerHeader(), registerBody);
};

/**
 * Request validation for 'register' endpoint request
 *
 * @returns
 */
export const validateLoginReq = () => {
  return _.concat(validateAuthBearerHeader(), loginBody);
};
