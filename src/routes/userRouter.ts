import express from "express";

import {
  getAppUser,
  getPsnUserAccountId,
  getPsnUserProfileByAccountId,
  getPsnUserProfileByUsername,
} from "@/controllers/userController";

const userRouter = express.Router();

userRouter.get("/:psnUsername/profile", getPsnUserProfileByUsername);

userRouter.get("/:accountId/profile", getPsnUserProfileByAccountId);

userRouter.get("/:psnUsername/accountId", getPsnUserAccountId);

userRouter.get("/:id", getAppUser);

export default userRouter;
