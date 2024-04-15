import { isUndefined, omitBy } from "lodash";
import { Types } from "mongoose";

export interface ILocation {
  _id?: string;
  name: string;
  address: string;

  latitude: number;
  longitude: number;

  createdAt?: Date;
  updatedAt?: Date;
}

export class Location implements ILocation {
  _id?: string;
  name: string;
  address: string;

  latitude: number;
  longitude: number;

  createdAt?: Date;
  updatedAt?: Date;

  constructor(input?: ILocation) {
    this._id = input._id
      ? input._id.toString()
      : new Types.ObjectId().toString();
    this.name = input.name;
    this.address = input.address;
    this.latitude = input.latitude;
    this.longitude = input.longitude;
    this.createdAt = input.createdAt;
    this.updatedAt = input.updatedAt;
  }
  toJSON() {
    return omitBy(this, isUndefined);
  }
}
