import express from "express";

import {
  loginUser,
  logoutUser,
  registerUser,
} from "@/controllers/authController";
import { psnAuthenticate } from "@/middlewares/psnAuthMiddleware";
import { REQUEST_PROPERTY, validateReq } from "@/middlewares/requestMiddleware";

const authRouter = express.Router();

authRouter.post(
  "/register",
  validateReq(REQUEST_PROPERTY.AUTH_HEADERS),
  psnAuthenticate,
  registerUser
);
authRouter.post(
  "/login",
  validateReq(REQUEST_PROPERTY.AUTH_HEADERS),
  psnAuthenticate,
  loginUser
);
authRouter.post("/logout", logoutUser);

export default authRouter;
