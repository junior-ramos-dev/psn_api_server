import express from "express";
import { header, validationResult } from "express-validator";
export const appTest = express();

appTest.use(express.json());
appTest.get(
  "/hello",
  header("authorization")
    .exists({ values: "undefined" })
    .withMessage("Missing Authorization Header"),
  (req, res) => {
    const result = validationResult(req);
    if (result.isEmpty()) {
      return res.send(`Hello, ${req.query!.person}!`);
    }

    res.send({ errors: result.array() });
  }
);

export default appTest;
// appTest.listen(3000);
