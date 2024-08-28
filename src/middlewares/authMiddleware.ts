import { NextFunction, Request, Response } from "express";
import asyncHandler from "express-async-handler";
import jwt, { JwtPayload } from "jsonwebtoken";

import {
  AuthenticationError,
  tryCatchErrorHandler,
} from "@/models/interfaces/common/error";
import { IAuthUser } from "@/models/interfaces/user";
import { User } from "@/models/schemas/user";

import { validateReqProperties } from "./validations/request/validateReqMiddleware";

const authenticate = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validate Request Headers
      // Find and validate the request properties
      validateReqProperties(req);

      const token = req.cookies.jwt;

      if (!token) {
        throw new AuthenticationError("Token not found");
      }

      const jwtSecret = process.env.JWT_SECRET ?? "";
      const decoded = jwt.verify(token, jwtSecret) as JwtPayload;

      if (!decoded?.userId) {
        throw new AuthenticationError("UserId not found");
      }

      const user = await User.findById(decoded.userId, "_id psnOnlineId email");

      if (!user) {
        throw new AuthenticationError("User not found");
      }

      // req.user = user;
      const authUser: IAuthUser = {
        id: String(user._id),
        psnOnlineId: user.psnOnlineId,
        email: user.email,
      };
      req.session.user = authUser;
      next();
    } catch (error: unknown) {
      tryCatchErrorHandler(error);
    }
  }
);

export { authenticate };
