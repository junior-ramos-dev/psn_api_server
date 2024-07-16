import { header } from "express-validator";

// the validator middleware will have already thrown a 403 if the header was missing,
// so you can be 100% sure that the header is present with validations you created.
export const validateRequest = (method: string) => {
  switch (method) {
    case "headers": {
      return validateHeaders;
    }
    case "body": {
      //TODO;
    }
    case "params": {
      //TODO;
    }
  }
};

const validateHeaders = [
  header("authorization")
    .exists({ values: "undefined" })
    .withMessage("Missing Authorization Header") // you can specify the message to show if a validation has failed
    .bail() // not necessary, but it stops execution if previous validation failed
    .contains("Bearer")
    .withMessage("Authorization Token is not Bearer"),
  header("accountid")
    .exists({ values: "undefined" })
    .withMessage("Missing AccountId Header") // you can specify the message to show if a validation has failed
    .bail(), // not necessary, but it stops execution if previous validation failed
];
