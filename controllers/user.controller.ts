import jwt from "jsonwebtoken";
import { NextFunction, Request, Response } from "express";
import { catchAsyncError } from "../middleware/error";
import userModel, { IUser } from "../models/user.model";
import ErrorHandler from "../utils/ErrorHandler";
import sendMail from "../utils/sendMail";
import {
  checkActiveToken,
  createActivationToken,
} from "../services/user.services";
import { sendToken } from "../utils/jwt";

// Register user
interface IRegistration {
  name: string;
  email: string;
  password: string;
  avatar?: string;
}

export const registrationUser = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, email, password } = req.body;
      const isEmailExist = await userModel.findOne({ email });

      if (isEmailExist) {
        return next(new ErrorHandler("Email already exist !", 400));
      }

      const user: IRegistration = {
        name,
        email,
        password,
      };

      const activationToken = createActivationToken(user);
      const activationCode = activationToken.activationCode;
      const data = { name, activationCode };

      // Send Activation mail
      try {
        await sendMail({
          email,
          subject: "Activate your account",
          template: "activation-mail.ejs",
          data,
        });
        res.status(201).json({
          success: true,
          message: `Please check your email: ${email} to active your account.`,
          activationToken: activationToken.token,
        });
      } catch (error: any) {
        return next(new ErrorHandler(error.message, 400));
      }
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

// Activate user
interface IActivateUser {
  activateToken: string;
  activateCode: string;
}

export const activateUser = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { activateToken, activateCode } = req.body as IActivateUser;

      const { isToken, user } = checkActiveToken(activateToken, activateCode);

      if (!isToken) {
        return next(new ErrorHandler("Invalid activation code !", 400));
      }

      const { name, email, password } = user;

      const existUser = await userModel.findOne({ email });
      console.log(existUser);

      if (existUser as any) {
        return next(new ErrorHandler("Email already exist !", 400));
      }
      const newUser = await userModel.create({
        name,
        email,
        password,
      });

      res.status(201).json({
        success: true,
        user: { name: newUser.name, email: newUser.email },
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

// LoginUser
interface ILoginUser {
  email: string;
  password: string;
}

export const loginUser = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body as ILoginUser;

      if (!email || !password) {
        return next(
          new ErrorHandler("Please enter your email and password !", 400)
        );
      }
      const user = await userModel.findOne({ email }).select("+password");

      if (!user) {
        return next(new ErrorHandler("Invalid email or password !", 400));
      }
      const isPasswordMatch = await user.comparePassword(password);

      if (!isPasswordMatch) {
        return next(new ErrorHandler("Invalid email or password", 400));
      }

      sendToken(user, 200, res);
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

// logout user
export const logoutUser = catchAsyncError(
  async (_req: Request, res: Response, next: NextFunction) => {
    try {
      res.cookie("access_token", "", { maxAge: 1 });
      res.cookie("refresh_token", "", { maxAge: 1 });
      res.status(200).json({
        success: true,
        message: "Logout successfully",
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);
