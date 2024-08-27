import { NextFunction, Request, Response } from "express";
import asyncHandler from "express-async-handler";
import jwt, { JwtPayload } from "jsonwebtoken";

import { PSN_AUTH } from "@/controllers/authController";
import {
  AuthenticationError,
  PsnApiError,
} from "@/models/interfaces/common/error";
import { IAuthUser } from "@/models/interfaces/user";
import { User } from "@/models/schemas/user";

const authenticate = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
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

      if (!PSN_AUTH) {
        throw new PsnApiError("Failed retrieving PSN API credentials");
      }

      // req.user = user;
      const authUser: IAuthUser = {
        id: String(user._id),
        psnOnlineId: user.psnOnlineId,
        email: user.email,
      };
      req.session.user = authUser;
      next();
    } catch (error) {
      if (error instanceof AuthenticationError) {
        throw new AuthenticationError(`Invalid token: ${error}`);
      } else if (error instanceof PsnApiError) {
        throw new PsnApiError(`Invalid credentials: ${error.message}`);
      }
    }
  }
);

export { authenticate };
