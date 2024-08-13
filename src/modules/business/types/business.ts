import { isUndefined, omitBy } from "lodash";
import { Types } from "mongoose";
import { IService } from "../../service";
import { IPlan } from "../../plan";
import { ILocation } from "../../location";
import { IGrowthCollaborative } from "../../growth-collaborative";
import { IUser } from "../../user";
import { IWaitWhileUser } from "../../wait-while-user";

export interface IBusiness {
  _id?: string;
  name: string;
  description: string;
  logo?: string;

  serviceIds: (string | IService)[];
  email: string;
  phoneNumber: string;

  planIds: (string | IPlan)[];
  growthCollaborativeId: string | IGrowthCollaborative;

  locationIds: (string | ILocation)[];

  userId: string | IUser;

  waitWhileUserId: (string | IWaitWhileUser)[];
  waitWhileLocationId: string;
  waitWhileScheduleLink: string;

  createdAt?: Date;
  updatedAt?: Date;
}

export class Business implements IBusiness {
  _id?: string;
  name: string;
  description: string;
  logo?: string;

  serviceIds: (string | IService)[];
  email: string;
  phoneNumber: string;

  planIds: (string | IPlan)[];
  growthCollaborativeId: string | IGrowthCollaborative;

  locationIds: (string | ILocation)[];

  userId: string | IUser;

  waitWhileUserId: (string | IWaitWhileUser)[];
  waitWhileLocationId: string;
  waitWhileScheduleLink: string;

  createdAt?: Date;
  updatedAt?: Date;

  constructor(input?: IBusiness) {
    this._id = input._id
      ? input._id.toString()
      : new Types.ObjectId().toString();
    this.name = input.name;
    this.description = input.description;
    this.logo = input.logo;

    this.serviceIds = input.serviceIds;
    this.email = input.email;
    this.phoneNumber = input.phoneNumber;

    this.planIds = input.planIds;
    this.growthCollaborativeId = input.growthCollaborativeId;

    this.locationIds = input.locationIds;

    this.userId = input.userId;

    this.waitWhileUserId = input.waitWhileUserId;
    this.waitWhileLocationId = input.waitWhileLocationId;
    this.waitWhileScheduleLink = input.waitWhileScheduleLink;

    this.createdAt = input.createdAt;
    this.updatedAt = input.updatedAt;
  }

  toJSON() {
    return omitBy(this, isUndefined);
  }
}
