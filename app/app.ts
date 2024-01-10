import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import morgan from "morgan";
import {
  catchAllUndefinedRoutes,
  globalErrorHandler,
} from "../middleware/error";
import userRouter from "../routes/user.route";
const app = express();

app.use(express.json({ limit: "50mb" }));
app.use(cookieParser());
app.use(cors({ origin: process.env.CORS_ORIGIN }));
app.use(morgan("combined"));

// router
app.use("/user/v1", userRouter);

// handling undefined routes
app.use(catchAllUndefinedRoutes);

// Global error handler
app.use(globalErrorHandler);

export default app;
