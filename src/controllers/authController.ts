import { Request, Response } from "express";

import { User } from "@/models/schemas/user";
import { clearToken, generateToken } from "@/utils/auth";

const registerUser = async (req: Request, res: Response) => {
  //TODO Check PSN username with accountId
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

const logoutUser = (req: Request, res: Response) => {
  clearToken(res);
  res.status(200).json({ message: "User logged out" });
};

export { authenticateUser, logoutUser, registerUser };
