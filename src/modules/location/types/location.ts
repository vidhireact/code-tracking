import { isUndefined, omitBy } from "lodash";
import { Types } from "mongoose";
import { IUser } from "../../user";
import { IBusiness } from "../../business";

export interface ILocation {
  _id?: string;
  name: string;
  address: string;

  latitude: number;
  longitude: number;

  userId: string | IUser;
  businessId: string | IBusiness;

  notificationTitle: string;
  email: string;
  scheduleLink: string;
  website: string;
  phoneNumber: string;

  createdAt?: Date;
  updatedAt?: Date;
}

export class Location implements ILocation {
  _id?: string;
  name: string;
  address: string;

  latitude: number;
  longitude: number;

  userId: string | IUser;
  businessId: string | IBusiness;

  notificationTitle: string;
  email: string;
  scheduleLink: string;
  website: string;
  phoneNumber: string;

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
    this.userId = input.userId;
    this.notificationTitle = input.notificationTitle;
    this.email = input.email;
    this.scheduleLink = input.scheduleLink;
    this.website = input.website;
    this.phoneNumber = input.phoneNumber;
    this.businessId = input.businessId;
    this.createdAt = input.createdAt;
    this.updatedAt = input.updatedAt;
  }
  toJSON() {
    return omitBy(this, isUndefined);
  }
}
