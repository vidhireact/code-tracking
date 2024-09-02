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
    email: {
      type: String,
    },
    phoneNumber: {
      type: String,
    },
    serviceIds: [
      {
        type: Types.ObjectId,
        ref: "service",
      },
    ],
    categoryIds: [
      {
        type: Types.ObjectId,
        ref: "category",
      }
    ],
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
    waitWhileUserId: [
      {
        type: Types.ObjectId,
        ref: "wait-while-user",
      },
    ],
    waitWhileLocationId: {
      type: String
    },
    waitWhileScheduleLink: {
      type: String
    }
  },
  {
    timestamps: true,
  }
);

export const BusinessModel = model<IBusiness>("business", business);
