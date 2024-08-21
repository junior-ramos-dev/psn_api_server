import { Request, Response } from "express";
import jwt from "jsonwebtoken";

import { User } from "@/models/schemas/user";
import { PsnAuth } from "@/services/psnApi/psnAuth";
import { getBearerTokenFromHeader } from "@/utils/http";

let PSN_AUTH: PsnAuth;

const generateToken = (res: Response, userId: string) => {
  const jwtSecret = process.env.JWT_SECRET || "";
  const token = jwt.sign({ userId }, jwtSecret, {
    expiresIn: "1h",
  });

  res.cookie("jwt", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV !== "development",
    sameSite: "strict",
    maxAge: 60 * 60 * 1000,
  });
};

const clearToken = (res: Response) => {
  res.cookie("jwt", "", {
    httpOnly: true,
    expires: new Date(0),
  });
};

const registerUser = async (req: Request, res: Response) => {
  const { psnUsername, email, password } = req.body;
  const usernameExists = await User.findOne({ psnUsername });
  const userEmailExists = await User.findOne({ email });

  if (usernameExists) {
    res.status(400).json({
      message: `An account with PSN Username '${psnUsername}' already exists!`,
    });
    return;
  }
  if (userEmailExists) {
    res
      .status(400)
      .json({ message: `An account with email '${email}' already exists!` });
    return;
  }

  const user = await User.create({
    psnUsername,
    email,
    password,
  });

  if (user) {
    // Get the PSN credentials for using with psn_api
    const authorization = req.headers["authorization"];

    if (authorization) {
      const NPSSO = getBearerTokenFromHeader(authorization);
      PSN_AUTH = await PsnAuth.createPsnAuth(NPSSO).then((psnAuth) => psnAuth);
    } else {
      return res.status(401).json({
        message: "An error occurred in creating the account: Missing 'NPSSO'",
      });
    }

    generateToken(res, String(user._id));
    res.status(201).json({
      id: user._id,
      psnUsername: user.psnUsername,
      email: user.email,
    });
  } else {
    res
      .status(400)
      .json({ message: "An error occurred in creating the account" });
  }
};

const authenticateUser = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (user && (await user.comparePassword(password))) {
    // Get the PSN credentials for using with psn_api
    const authorization = req.headers["authorization"];

    if (authorization) {
      const NPSSO = getBearerTokenFromHeader(authorization);
      PSN_AUTH = await PsnAuth.createPsnAuth(NPSSO).then((psnAuth) => psnAuth);
    } else {
      return res
        .status(401)
        .json({ message: "An error occurred in login: Missing 'NPSSO'" });
    }

    generateToken(res, String(user._id));
    res.status(201).json({
      id: user._id,
      psnUsername: user.psnUsername,
      email: user.email,
    });
  } else {
    res.status(401).json({ message: "User not found / password incorrect" });
  }
};

const logoutUser = async (req: Request, res: Response) => {
  // Unset the PSN credentials used with psn_api
  PSN_AUTH = PsnAuth.clearPsnAuth(PSN_AUTH);

  clearToken(res);
  res.status(200).json({ message: "User logged out" });
};

export { authenticateUser, logoutUser, PSN_AUTH, registerUser };
