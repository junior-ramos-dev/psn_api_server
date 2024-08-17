import express from "express";

import { getUser } from "@/controllers/userController";

const userRouter = express.Router();

userRouter.get("/:id", getUser);

export default userRouter;
