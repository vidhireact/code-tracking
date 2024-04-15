import { isUndefined, omitBy } from "lodash";
import { Types } from "mongoose";
import { IService } from "../../service";
import { IPlan } from "../../plan";
import { ILocation } from "../../location";
import { IGrowthCollaborative } from "../../growth-collaborative";

export interface IBusiness {
  _id?: string;
  name: string;
  description: string;
  logo?: string;

  service: string | IService;

  planIds: (string | IPlan)[];
  growthCollaborativeIds: (string | IGrowthCollaborative)[];

  locationIds: (string | ILocation)[];

  createdAt?: Date;
  updatedAt?: Date;
}

export class Business implements IBusiness {
  _id?: string;
  name: string;
  description: string;
  logo?: string;

  service: string | IService;

  planIds: (string | IPlan)[];
  growthCollaborativeIds: (string | IGrowthCollaborative)[];

  locationIds: (string | ILocation)[];

  createdAt?: Date;
  updatedAt?: Date;

  constructor(input?: IBusiness) {
    this._id = input._id
      ? input._id.toString()
      : new Types.ObjectId().toString();
    this.name = input.name;
    this.description = input.description;
    this.logo = input.logo;

    this.service = input.service;

    this.planIds = input.planIds;
    this.growthCollaborativeIds = input.growthCollaborativeIds;

    this.locationIds = input.locationIds;

    this.createdAt = input.createdAt;
    this.updatedAt = input.updatedAt;
  }

  toJSON() {
    return omitBy(this, isUndefined);
  }
}
