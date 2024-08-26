import express from "express";

import {
  authenticateUser,
  logoutUser,
  registerUser,
} from "@/controllers/authController";
import { REQUEST_PROPERTY, validateReq } from "@/middlewares/requestMiddleware";

const authRouter = express.Router();

authRouter.post(
  "/register",
  validateReq(REQUEST_PROPERTY.AUTH_HEADERS),
  registerUser
);
authRouter.post(
  "/login",
  validateReq(REQUEST_PROPERTY.AUTH_HEADERS),
  authenticateUser
);
authRouter.post("/logout", logoutUser);

export default authRouter;
