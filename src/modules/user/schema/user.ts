import { Schema, model, Types } from "mongoose";
import { IUser } from "../types";

const user = new Schema<IUser>(
  {
    fistName: {
      type: String,
    },
    lastName: {
      type: String,
    },
    phoneNumber: {
      type: String,
      unique: true,
      required: true,
    },
    isPhoneVerified: {
      type: Boolean,
      default: false,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    password: {
      type: String,
      required: true,
    },
    address: {
      type: String,
    },
    latitude: {
      type: Number,
    },
    longitude: {
      type: Number,
    },
    selectedRadius: {
      type: Number,
    },
    profilePic: {
      type: String,
    },
    userType: {
      type: String,
      required: true,
      default: "USER",
    },
  },

  { timestamps: true }
);

export const UserModel = model<IUser>("users", user);
