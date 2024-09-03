import express from "express";

import { getUserById, getUserProfileById } from "@/controllers/userController";
import { authenticate } from "@/middlewares/authMiddleware";

const userRouter = express.Router();

userRouter.get("/", authenticate, getUserById);

userRouter.get("/profile", authenticate, getUserProfileById);

export default userRouter;
