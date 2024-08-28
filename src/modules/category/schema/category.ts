import { Schema, model, Types } from "mongoose";
import { ICategory } from "../types";

const category = new Schema<ICategory>(
  {
    name: {
      type: String,
    },
    waitWhileCategoryId: {
      type: String,
    },
    createdAt: {
      type: Date,
    },
    updatedAt: {
      type: Date,
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

export const CategoryModel = model<ICategory>("category", category);
