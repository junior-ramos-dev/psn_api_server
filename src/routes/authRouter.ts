import express from "express";
import {
  registerUser,
  authenticateUser,
  logoutUser,
} from "../controllers/authController";
// import { getAcessToken } from "../controllers/authPsnController";

const authRouter = express.Router();

authRouter.post("/register", registerUser);
authRouter.post("/login", authenticateUser);
authRouter.post("/logout", logoutUser);
//TODO Send the access token on user loggin
// authRouter.get("/psnAuth", getAcessToken);

export default authRouter;
