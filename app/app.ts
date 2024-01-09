import cookieParser from "cookie-parser";
import cors from "cors";
import express, { NextFunction, Request, Response } from "express";
const app = express();

app.use(express.json({ limit: "50mb" }));
app.use(cookieParser());
app.use(cors({ origin: process.env.CORS_ORIGIN }));

app.get("/v1/test", (_req: Request, res: Response) => {
  res.status(200).json({ success: true, message: "Test API" });
});

// unknown routes
app.all("*", (req: Request, _res: Response, next: NextFunction) => {
  const err = new Error(`Route ${req.originalUrl} not found!`) as any;
  err.statusCode = 404;
  next(err);
});

export default app;
