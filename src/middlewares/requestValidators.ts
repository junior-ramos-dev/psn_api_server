import { header } from "express-validator";

// the validator middleware will have already thrown a 403 if the header was missing,
// so you can be 100% sure that the header is present with validations you created.
export const validateRequest = (method: string) => {
  switch (method) {
    case "headers": {
      return validateHeaders;
    }
    case "body": {
      return;
    }
    case "params": {
      return;
    }
  }
};

const validateHeaders = [
  header("etag")
    .exists({ values: "undefined" })
    .withMessage("Missing ETag Header") // you can specify the message to show if a validation has failed
    .bail(), // not necessary, but it stops execution if previous validation failed
  // header("authorization")
  //   .exists({ values: "undefined" })
  //   .withMessage("Missing Authorization Header")
  //   .bail()
  //   .contains("Bearer")
  //   .withMessage("Authorization Token is not Bearer"),
  // header("accountid")
  //   .exists({ values: "undefined" })
  //   .withMessage("Missing AccountId Header")
  //   .bail(),
];
