import { NextFunction, Request, Response } from "express";
import asyncHandler from "express-async-handler";
import jwt, { JwtPayload } from "jsonwebtoken";

import { PSN_AUTH } from "@/controllers/authController";
import {
  AuthenticationError,
  PsnApiError,
} from "@/models/interfaces/common/error";
import { User } from "@/models/schemas/user";

const authenticate = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const token = req.cookies.jwt;

      if (!token) {
        throw new AuthenticationError("Token not found");
      }

      const jwtSecret = process.env.JWT_SECRET || "";
      const decoded = jwt.verify(token, jwtSecret) as JwtPayload;

      if (!decoded || !decoded.userId) {
        throw new AuthenticationError("UserId not found");
      }

      const user = await User.findById(decoded.userId, "_id name email");

      if (!user) {
        throw new AuthenticationError("User not found");
      }

      if (!PSN_AUTH) {
        throw new PsnApiError("Failed retrieving PSN API credentials");
      }

      req.user = user;
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
