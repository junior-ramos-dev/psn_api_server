import { NextFunction, Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { validationResult } from "express-validator";

import { PsnApiError } from "@/models/interfaces/common/error";
import { getBearerTokenFromHeader } from "@/utils/http";

const psnAuthenticate = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validate Request Headers
      // Find and validate the request properties
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        res.status(422).json({ errors: errors.array() });
        return;
      }

      const authorization = req.headers["authorization"];

      if (!authorization) {
        throw new PsnApiError(
          "NPSSO not found. To get a NPSSO code, visit https://ca.account.sony.com/api/v1/ssocookie."
        );
      }

      const npsso = getBearerTokenFromHeader(authorization);

      req.session.npsso = npsso;

      next();
    } catch (error) {
      if (error instanceof PsnApiError) {
        throw new PsnApiError(`Invalid NPSSO code: ${error.message}`);
      }
    }
  }
);

export { psnAuthenticate };
