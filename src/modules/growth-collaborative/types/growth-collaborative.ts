import { isUndefined, omitBy } from "lodash";
import { Types } from "mongoose";
import { IService } from "../../service";

export interface IGrowthCollaborative {
  _id?: string;
  name: string;
  description: string;

  cutOFF: number;
  keyFeatures: string;
  percentage: number;

  serviceId: (string | IService)[];

  createdAt?: Date;
  updatedAt?: Date;
}

export class GrowthCollaborative implements IGrowthCollaborative {
  _id?: string;
  name: string;
  description: string;

  cutOFF: number;
  keyFeatures: string;
  percentage: number;

  serviceId: (string | IService)[];

  createdAt?: Date;
  updatedAt?: Date;

  constructor(input?: IGrowthCollaborative) {
    this._id = input._id
      ? input._id.toString()
      : new Types.ObjectId().toString();
    this.name = input.name;
    this.description = input.description;
    this.keyFeatures = input.keyFeatures;
    this.percentage = input.percentage;
    this.cutOFF = input.cutOFF;

    this.serviceId = input.serviceId;
    this.createdAt = input.createdAt;
    this.updatedAt = input.updatedAt;
  }

  toJSON() {
    return omitBy(this, isUndefined);
  }
}
