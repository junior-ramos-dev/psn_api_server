import { Request } from "express";
import { validationResult } from "express-validator";

import { RequestError } from "@/models/interfaces/common/error";

/**
 * Validate the request properties
 *
 * The validator 'validationResult' from 'express-validator' middleware
 * will thrown a "422 Unprocessable Content (WebDAV)"" if the header was missing.
 *
 * See https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/422
 *
 * @param req
 * @returns
 */
export const validateReqProperties = (req: Request) => {
  // Validate Request
  // Find and validate the request properties
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const message = "Validating request properties failed";
    // return res.status(422).json({ errors: errors.array() });
    throw new RequestError(message, errors.array());
  }
};
