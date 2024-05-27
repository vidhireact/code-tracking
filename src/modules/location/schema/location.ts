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
    notificationTitle: {
      type: String,
    },
    email: {
      type: String,
    },
    scheduleLink: {
      type: String,
    },
    website: {
      type: String,
    },
    phoneNumber: {
      type: String,
    },
    userId: {
      type: Types.ObjectId,
      ref: "user",
    },
    businessId: {
      type: Types.ObjectId,
      ref: "business",
    },
  },
  { timestamps: true }
);
export const LocationModel = model<ILocation>("location", location);
