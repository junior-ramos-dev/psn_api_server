import express from "express";

import { getUserById, getUserProfileById } from "@/controllers/userController";
import { REQUEST_PROPERTY, validateReq } from "@/middlewares/requestMiddleware";

const userRouter = express.Router();

userRouter.get("/:userId", getUserById);

userRouter.get(
  "/:userId/profile",
  validateReq(REQUEST_PROPERTY.HEADERS),
  getUserProfileById
);

export default userRouter;
