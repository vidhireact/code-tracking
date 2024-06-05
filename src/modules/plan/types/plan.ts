import { isUndefined, omitBy } from "lodash";
import { Types } from "mongoose";
import { IService } from "../../service";
import { IUser } from "../../user";

export interface IPlan {
  _id?: string;
  name: string;
  description: string;

  keyFeatures: string;
  price: number;

  duration: number; // In Days
  visits: number;

  serviceId: (string | IService)[];
  likedBy?: (string | IUser)[];

  createdAt?: Date;
  updatedAt?: Date;
}

export class Plan implements IPlan {
  _id?: string;
  name: string;
  description: string;

  keyFeatures: string;
  price: number;

  duration: number; // In Days
  visits: number;

  serviceId: (string | IService)[];
  likedBy?: (string | IUser)[];

  createdAt?: Date;
  updatedAt?: Date;

  constructor(input?: IPlan) {
    this._id = input._id
      ? input._id.toString()
      : new Types.ObjectId().toString();
    this.name = input.name;
    this.description = input.description;
    this.keyFeatures = input.keyFeatures;
    this.price = input.price;
    this.duration = input.duration;
    this.visits = input.visits;
    this.serviceId = input.serviceId;
    this.likedBy = input.likedBy;
    this.createdAt = input.createdAt;
    this.updatedAt = input.updatedAt;
  }

  toJSON() {
    return omitBy(this, isUndefined);
  }
}
