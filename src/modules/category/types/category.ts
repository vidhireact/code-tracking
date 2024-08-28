import { Types } from "mongoose";
import { IService } from "../../service";
import { isUndefined, omitBy } from "lodash";

export interface ICategory {
  _id?: string;
  name: string;
  waitWhileCategoryId: string;
  serviceIds: (string | IService)[];
  createdAt?: Date;
  updatedAt?: Date;
}

export class Category implements ICategory {
  _id?: string;
  name: string;
  waitWhileCategoryId: string;
  serviceIds: (string | IService)[];
  createdAt?: Date;
  updatedAt?: Date;

  constructor(input?: ICategory) {
    this._id = input._id
      ? input._id.toString()
      : new Types.ObjectId().toString();
    this.name = input.name;
    this.waitWhileCategoryId = input.waitWhileCategoryId;
    this.serviceIds = input.serviceIds;
    this.createdAt = input.createdAt;
    this.updatedAt = input.updatedAt;
  }
  toJSON() {
    return omitBy(this, isUndefined);
  }
}
