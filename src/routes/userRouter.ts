import express from "express";

import { getUserById, getUserProfileById } from "@/controllers/userController";

const userRouter = express.Router();

userRouter.get("/:userId", getUserById);

userRouter.get("/:userId/profile", getUserProfileById);

export default userRouter;
