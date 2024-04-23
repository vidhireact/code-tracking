import { Schema, model, Types } from "mongoose";
import { ILocation } from "../types";

const location = new Schema<ILocation>(
  {
    name: {
      type: String,
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
    userId: {
      type: Types.ObjectId,
      ref: "user",
    },
  },
  { timestamps: true }
);
export const LocationModel = model<ILocation>("location", location);
