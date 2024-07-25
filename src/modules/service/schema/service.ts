import { Schema, model, Types } from "mongoose";
import { IService } from "../types";

const service = new Schema<IService>(
  {
    name: {
      type: String,
    },
    waitWhileServiceId: {
      type: String
    },
    createdAt: {
      type: Date,
    },
    updatedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);
export const ServiceModel = model<IService>("service", service);
