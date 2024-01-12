import mongoose, { Document, Model, Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  avatar: {
    public_id: string;
    url: string;
  };
  role: string;
  isVerified: boolean;
  courses: Array<{ courseId: string }>;
  comparePassword: (password: string) => Promise<boolean>;
  SignAccessToken: () => string;
  SignRefreshToken: () => string;
}

const userSchema: Schema<IUser> = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please enter the name !"],
    },
    email: {
      type: String,
      required: [true, "Please enter the email !"],
      validate: {
        validator: async function (value: string) {
          return /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/.test(value);
        },
      },
    },
    password: {
      type: String,
      required: [true, "Please enter the password !"],
      minlength: [6, "Password must be at least 6 characters !"],
      select: false,
    },
    avatar: {
      public_id: String,
      url: String,
    },
    role: {
      type: String,
      default: "user",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    courses: [{ courseId: String }],
  },
  { timestamps: true }
);

// Hash Password before saving
userSchema.pre<IUser>("save", async function (next) {
  try {
    if (!this.isModified("password")) {
      return next();
    }
    this.password = await bcrypt.hash(this.password, 10);
    return next();
  } catch (error: any) {
    return next(error);
  }
});

// Sign Access token
userSchema.methods.SignAccessToken = function () {
  try {
    return jwt.sign({ id: this._id }, process.env.ACCESS_TOKEN_SECRET || "");
  } catch (error) {
    throw new Error("Error signing access token");
  }
};

// Sign Refresh token
userSchema.methods.SignRefreshToken = function () {
  try {
    return jwt.sign({ id: this._id }, process.env.REFRESH_TOKEN_SECRET || "");
  } catch (error) {
    throw new Error("Error signing refresh token");
  }
};

// Compare password
userSchema.methods.comparePassword = async function (
  enteredPassword: string
): Promise<boolean> {
  return await bcrypt.compare(enteredPassword, this.password);
};

const userModel: Model<IUser> = mongoose.model("User", userSchema);

export default userModel;
