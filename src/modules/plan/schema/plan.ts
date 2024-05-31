import { Schema, model, Types } from "mongoose";
import { IPlan } from "../types";

const plan = new Schema<IPlan>(
  {
    name: {
      type: String,
    },
    description: {
      type: String,
    },
    keyFeatures: {
      type: String,
    },
    price: {
      type: Number,
    },
    duration: {
      type: Number,
    },
    visits: {
      type: Number,
    },
    serviceId: [
      {
        type: Types.ObjectId,
        ref: "service",
      },
    ],
  },
  { timestamps: true }
);

export const PlanModel = model<IPlan>("plan", plan);
