import express from "express";

import { getUserById, getUserProfileById } from "@/controllers/userController";
import { REQUEST_PROPERTY, validateReq } from "@/middlewares/requestMiddleware";

const userRouter = express.Router();

userRouter.get("/", getUserById);

userRouter.get(
  "/profile",
  validateReq(REQUEST_PROPERTY.HEADERS),
  getUserProfileById
);

export default userRouter;
