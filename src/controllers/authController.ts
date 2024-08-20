import { Request, Response } from "express";

import { User } from "@/models/schemas/user";
import { PsnAuth } from "@/services/psnApi/psnAuth";
import { clearToken, generateToken } from "@/utils/auth";

//TODO Remove from .env file
const NPSSO = process.env.PSN_NPSSO!;
let PSN_AUTH: PsnAuth;

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
    PSN_AUTH = await PsnAuth.createPsnAuth(NPSSO).then((psnAuth) => psnAuth);

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
    PSN_AUTH = await PsnAuth.createPsnAuth(NPSSO).then((psnAuth) => psnAuth);

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
