import { isUndefined, omitBy } from "lodash";
import { Types } from "mongoose";
import { IUser } from "../../user";
import { IPlan } from "../../plan";
import { IBusiness } from "../../business";
import { ILocation } from "../../location";
import { IService } from "../../service";
import { ICategory } from "../../category";

export interface ISubscription {
  _id?: string;

  userId: string | IUser;
  planId: string | IPlan;
  businessId?: string | IBusiness;
  locationId: string | ILocation;
  categoryId: string | ICategory;
  serviceId: string | IService;

  associated: boolean;
  associatedDate?: Date;

  startDate?: Date;
  endDate?: Date;

  createdAt?: Date;
  updatedAt?: Date;
}

export class Subscription implements ISubscription {
  _id?: string;

  userId: string | IUser;
  planId: string | IPlan;
  businessId?: string | IBusiness;
  locationId: string | ILocation;
  categoryId: string | ICategory;
  serviceId: string | IService;

  associated: boolean;
  associatedDate?: Date;

  startDate?: Date;
  endDate?: Date;

  createdAt?: Date;
  updatedAt?: Date;

  constructor(input?: ISubscription) {
    this._id = input._id
      ? input._id.toString()
      : new Types.ObjectId().toString();
    this.userId = input.userId;
    this.planId = input.planId;
    this.businessId = input.businessId;

    this.locationId = input.locationId;
    this.categoryId = input.categoryId;
    this.serviceId = input.serviceId;
    this.associated = input.associated;
    this.associatedDate = input.associatedDate;
    this.startDate = input.startDate;
    this.endDate = input.endDate;
    this.createdAt = input.createdAt;
    this.updatedAt = input.updatedAt;
  }

  toJSON() {
    return omitBy(this, isUndefined);
  }
}
