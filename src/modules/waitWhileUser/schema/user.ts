import { Schema, model, Types } from "mongoose";
import { waitWhileIUser } from "../types";

const user = new Schema<waitWhileIUser>(
  {
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

export const waitWhileUser = model<waitWhileIUser>("wait-while-user", user);
