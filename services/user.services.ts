import jwt, { Secret } from "jsonwebtoken";
import { IUser } from "../models/user.model";

interface IActivationToken {
  token: string;
  activationCode: string;
}

export const createActivationToken = (user: any): IActivationToken => {
  const activationCode = (Math.floor(Math.random() * 10000) + 10000).toString();

  const token = jwt.sign(
    { user, activationCode },
    process.env.ACTIVATION_SECRET as Secret,
    { expiresIn: "5m" }
  );
  return { activationCode, token };
};

interface ICheckActiveToken {
  isToken: boolean;
  user: IUser;
}
export const checkActiveToken = (
  activateToken: string,
  activateCode: string
): ICheckActiveToken => {
  const newUser: { user: IUser; activationCode: string } = jwt.verify(
    activateToken,
    process.env.ACTIVATION_SECRET as string
  ) as { user: IUser; activationCode: string };

  return {
    isToken: newUser.activationCode === activateCode,
    user: newUser.user,
  };
};
