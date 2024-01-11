import { NextFunction, Request, Response } from "express";
import { catchAsyncError } from "../middleware/error";
import userModel from "../models/user.model";
import ErrorHandler from "../utils/ErrorHandler";
import sendMail from "../utils/sendMail";
import { createActivationToken } from "../services/user.services";

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
