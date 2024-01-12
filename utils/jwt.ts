import { Response } from "express";
import { IUser } from "../models/user.model";
import { redis } from "./redis";

interface ITokenOptions {
  expires: Date;
  maxAge: number;
  httpOnly: boolean;
  sameSite: "lax" | "strict" | "none" | undefined;
  secure?: boolean;
}

export const sendToken = async (
  user: IUser,
  statusCode: number,
  res: Response
) => {
  const accessToken = user.SignAccessToken();
  const refreshToken = user.SignAccessToken();

  //Upload session to redis
  await redis.set(user._id, JSON.stringify(user) as any);

  // parse environment variables to integrates with fallback values
  const accessTokenExpire = parseInt(
    process.env.ACCESS_TOKEN_EXPIRE || "300",
    10
  );
  const refreshTokenExpire = parseInt(
    process.env.REFRESH_TOKEN_EXPIRE || "1200",
    10
  );

  // options for cookies
  const accessTokenOption: ITokenOptions = {
    expires: new Date(Date.now() + accessTokenExpire * 1000),
    maxAge: accessTokenExpire * 1000,
    httpOnly: true,
    sameSite: "lax",
  };

  const refreshTokenOption: ITokenOptions = {
    expires: new Date(Date.now() + refreshTokenExpire * 1000),
    maxAge: refreshTokenExpire * 1000,
    httpOnly: true,
    sameSite: "lax",
  };

  // only set secure to true in production
  if (process.env.NODE_DEV === "production") {
    accessTokenOption.secure = true;
  }
  res.cookie("access_token", accessToken, accessTokenOption);
  res.cookie("refresh_token", refreshToken, refreshTokenOption);

  res.status(statusCode).json({
    success: true,
    user,
    accessToken,
  });
};
