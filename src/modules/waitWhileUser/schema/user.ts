import { Schema, model, Types } from "mongoose";
import { IWaitWhileUser } from "../types";

const user = new Schema<IWaitWhileUser>(
  {
    name: {
      type: String,
    },
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    businessId: {
      type: Types.ObjectId,
      ref: "business",
    },
    roles: {
      type: [String],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const waitWhileUserModel = model<IWaitWhileUser>(
  "wait-while-user",
  user
);
