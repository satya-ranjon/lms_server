import { NextFunction, Request, Response } from "express";
import ErrorHandler from "../utils/ErrorHandler";

// Catch-all route for handling undefined routes.
export const catchAllUndefinedRoutes = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const error = new Error(`Can't find ${req.originalUrl} this route`);
  res.status(404).json({ message: error.message });
  next(error);
};

//  Global error handler middleware.
export const globalErrorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  err.statusCode = err.statusCode || 500;
  err.message = err.message || "Internal Server Error !";

  // wrong mongoDB id error
  if (err.name === "CasError") {
    err = new ErrorHandler(`Resource not found. Invalid: ${err.path} !`, 400);
  }

  // duplicate key error
  if (err.code === 11000) {
    err = new ErrorHandler(
      `Duplicate ${Object.keys(err.keyValue)} entered !`,
      400
    );
  }

  // wrong jwt error
  if (err.name === "jsonWebTokenError") {
    err = new ErrorHandler(`JsonWebToken is invalid,try again !`, 400);
  }

  // jwt expired error
  if (err.name === "TokenExpiredError") {
    err = new ErrorHandler(`JsonWebToken is expired,try again !`, 400);
  }

  res.status(err.statusCode).json({ success: false, message: err.message });
};
