import { AES, enc } from "crypto-js";
import { NextFunction, Response } from "express";
import { Request } from "./../request";
import { getUserById, User } from "../modules/user";
import { set as setGlobalContext } from "express-http-context";

export const validatePassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token =
    req.headers.authorization ||
    req.signedCookies.auth ||
    req.signedCookies.admin_auth;

  if (!token) {
    res.status(403).json({ message: "Unauthorized request." });
    return;
  }

  const userId = AES.decrypt(token, process.env.AES_KEY).toString(enc.Utf8);

  if (!userId) {
    res.status(403).json({ message: "Unauthorized request." });
    return;
  }

  const user: User = await getUserById(userId);
  if (!user) {
    res.status(403).json({ message: "Unauthorized request." });
    return;
  }

  if (!req.body.password) {
    res.status(400).json({ message: "Password is required" });
    return;
  }

  const userPassword = AES.decrypt(
    user.password,
    process.env.JWT_PASSWORD_SECRET
  ).toString(enc.Utf8);

  if (userPassword !== req.body.password) {
    res.status(401).json({ message: "Invalid password" });
    return;
  }

  const userRawData = user.toJSON();
  delete userRawData.password;

  req.authUser = userRawData;
  setGlobalContext("authUser", userRawData);

  next();
  return;
};
