import { NextFunction, Request, Response } from "express";
import asyncHandler from "express-async-handler";

import {
  PsnApiError,
  tryCatchErrorHandler,
} from "@/models/interfaces/common/error";
import { checkNpssoFormat, getBearerTokenFromHeader } from "@/utils/http";

import { validateReqProperties } from "./validations/request/validateReqMiddleware";

const psnAuthenticate = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validate Request Headers
      // Find and validate the request properties
      validateReqProperties(req);

      const authorization = req.headers["authorization"];

      // Extract NPSSO code sent in the Authorization Bearer header
      const npsso = getBearerTokenFromHeader(authorization!);

      if (!checkNpssoFormat(npsso)) {
        throw new PsnApiError(
          "Invalid NPSSO code. To get a NPSSO code, log into your PSN account and visit https://ca.account.sony.com/api/v1/ssocookie"
        );
      }

      req.session.npsso = npsso;

      next();
    } catch (error: unknown) {
      // if (error instanceof PsnApiError) {
      //   throw new PsnApiError(`Invalid NPSSO code: ${error.message}`);
      // }
      tryCatchErrorHandler(error);
    }
  }
);

export { psnAuthenticate };
