import { Schema, model, Types } from "mongoose";
import { IBusiness } from "../types";

const business = new Schema<IBusiness>(
  {
    name: {
      type: String,
    },
    description: {
      type: String,
    },
    logo: {
      type: String,
    },
    service: {
      type: Types.ObjectId,
      ref: "service",
    },
    planIds: [
      {
        type: Types.ObjectId,
        ref: "plan",
      },
    ],
    growthCollaborativeId: {
      type: Types.ObjectId,
      ref: "growth-collaborative",
    },
    locationIds: [
      {
        type: Types.ObjectId,
        ref: "location",
      },
    ],
    userId: {
      type: Types.ObjectId,
      ref: "user",
    },
  },
  {
    timestamps: true,
  }
);

export const BusinessModel = model<IBusiness>("business", business);
