import { Schema, model, Types } from "mongoose";
import { IGrowthCollaborative } from "../types";

const growthCollaborative = new Schema<IGrowthCollaborative>(
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
    percentage: {
      type: Number,
    },
    cutOFF: {
      type: Number,
    },

    serviceIds: [
      {
        type: Types.ObjectId,
        ref: "service",
      },
    ],
  },
  { timestamps: true }
);

export const GrowthCollaborativeModel = model<IGrowthCollaborative>(
  "growth-collaborative",
  growthCollaborative
);
