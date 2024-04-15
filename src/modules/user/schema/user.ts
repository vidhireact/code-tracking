import { Schema, model, Types } from "mongoose";
import { IUser } from "../types";

const user = new Schema<IUser>(
  {
    email: {
      type: String,
    },
    password: {
      type: String,
    },
    phoneNumber: {
      type: String,
    },
    fullName: {
      type: String,
    },

    isEmailVerified: {
      type: Boolean,
    },

    FCMToken: [
      {
        type: String,
      },
    ],

    dob: {
      type: Date,
    },
    address: {
      type: String,
    },
    profilePic: {
      type: String,
      // type: Types.ObjectId,
      // ref: "file",
    },
    googleId: {
      type: String,
    },
    googleLogin: {
      type: Boolean,
    },
    userType: {
      type: String,
    },
  },
  { timestamps: true }
);

export const UserModel = model<IUser>("users", user);
