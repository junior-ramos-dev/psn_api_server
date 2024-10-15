import express from "express";

import {
  loginUser,
  logoutUser,
  registerLoader,
  registerUser,
} from "@/controllers/authController";
import { psnAuthenticate } from "@/middlewares/psnAuthMiddleware";
import {
  validateLoginReq,
  validateRegisterReq,
} from "@/middlewares/validations/request/auth";

const authRouter = express.Router();

authRouter.post(
  "/register/loader",
  validateRegisterReq(),
  psnAuthenticate,
  registerLoader
);

authRouter.post(
  "/register",
  validateRegisterReq(),
  psnAuthenticate,
  registerUser
);

authRouter.post("/login", validateLoginReq(), psnAuthenticate, loginUser);
authRouter.post("/logout", logoutUser);

export default authRouter;
