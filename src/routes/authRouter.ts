import express from "express";

import {
  loginUser,
  logoutUser,
  registerUser,
} from "@/controllers/authController";
import { psnAuthenticate } from "@/middlewares/psnAuthMiddleware";
import {
  validateLoginReq,
  validateRegisterReq,
} from "@/middlewares/validations/request/auth";
import { taskProgressLoaderWrapper } from "@/services/loaders/taskProgressLoaderWrapper";

const authRouter = express.Router();

authRouter.post(
  "/register/loader",
  validateRegisterReq(),
  psnAuthenticate,
  taskProgressLoaderWrapper
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
