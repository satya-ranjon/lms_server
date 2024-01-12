import express from "express";
import {
  activateUser,
  loginUser,
  registrationUser,
} from "../controllers/user.controller";

const userRouter = express.Router();

userRouter.post("/registration", registrationUser);
userRouter.post("/login", loginUser);
userRouter.post("/activate/user", activateUser);

export default userRouter;
