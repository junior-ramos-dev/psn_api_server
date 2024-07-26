import express from "express";
import {
  registerUser,
  authenticateUser,
  logoutUser,
} from "../controllers/authController";

const authRouter = express.Router();

authRouter.post("/register", registerUser);
authRouter.post("/login", authenticateUser);
authRouter.post("/logout", logoutUser);

export default authRouter;
