import cookieParser from "cookie-parser";
import cors from "cors";
import express, { NextFunction, Request, Response } from "express";
import {
  catchAllUndefinedRoutes,
  globalErrorHandler,
} from "../middleware/error";
const app = express();

app.use(express.json({ limit: "50mb" }));
app.use(cookieParser());
app.use(cors({ origin: process.env.CORS_ORIGIN }));

app.get("/v1/test", (_req: Request, res: Response) => {
  res.status(200).json({ success: true, message: "Test API" });
});

// handling undefined routes
app.use(catchAllUndefinedRoutes);

// Global error handler
app.use(globalErrorHandler);

export default app;
