import { Types } from "mongoose";
import { IUser } from "../../user";
import { isUndefined, omitBy } from "lodash";
import { IService } from "../../service";
import { ICategory } from "../../category";

export interface IPreferredLocation {
  _id?: string;
  range: number;
  rangeType: string;
  address: string;
  latitude: number;
  longitude: number;

  userId: string | IUser;
  categoryId: string | ICategory;
  serviceId?: string | IService;

  createdAt?: Date;
  updatedAt?: Date;
}

export class PreferredLocation implements IPreferredLocation {
  _id?: string;
  range: number;
  rangeType: string;
  address: string;
  latitude: number;
  longitude: number;

  userId: string | IUser;
  categoryId: string | ICategory;
  serviceId?: string | IService;

  createdAt?: Date;
  updatedAt?: Date;

  constructor(input?: IPreferredLocation) {
    this._id = input._id
      ? input._id.toString()
      : new Types.ObjectId().toString();
    this.range = input.range;
    this.rangeType = input.rangeType;
    this.address = input.address;
    this.latitude = input.latitude;
    this.longitude = input.longitude;
    this.userId = input.userId;
    this.categoryId = input.categoryId;
    this.serviceId = input.serviceId;
    this.createdAt = input.createdAt;
    this.updatedAt = input.updatedAt;
  }

  toJSON() {
    return omitBy(this, isUndefined);
  }
}
