import { Schema, model, Types } from "mongoose";
import { IPreferredLocation } from "..";

const preferredLocation = new Schema<IPreferredLocation>({
  range: {
    type: Number,
  },
  rangeType: {
    type: String,
    default: "KM",
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
  serviceId: {
    type: Types.ObjectId,
    ref: "service",
  },
});

export const PreferredLocationModel = model<IPreferredLocation>(
  "preferred-location",
  preferredLocation
);
