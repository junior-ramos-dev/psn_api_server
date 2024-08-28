import express from "express";

import { getUserById, getUserProfileById } from "@/controllers/userController";
import { authenticate } from "@/middlewares/authMiddleware";
import { validateEtagHeader } from "@/middlewares/validations/request/defaults";

const userRouter = express.Router();

userRouter.get("/", authenticate, getUserById);

userRouter.get(
  "/profile",
  validateEtagHeader(),
  authenticate,
  getUserProfileById
);

export default userRouter;
