import { Schema, model, Types } from "mongoose";
import { ISubscription } from "../types";

const subscription = new Schema<ISubscription>(
  {
    userId: {
      type: Types.ObjectId,
      ref: "user",
    },
    planId: {
      type: Types.ObjectId,
      ref: "plan",
    },
    businessId: {
      type: Types.ObjectId,
      ref: "business",
    },
    locationId: {
      type: Types.ObjectId,
      ref: "location",
    },
    serviceId: {
      type: Types.ObjectId,
      ref: "service",
    },

    associated: {
      type: Boolean,
      default: false,
    },
    associatedDate: {
      type: Date,
    },
    startDate: {
      type: Date,
    },
    endDate: {
      type: Date,
    },
  },
  { timestamps: true }
);

export const SubscriptionModel = model<ISubscription>(
  "subscription",
  subscription
);
