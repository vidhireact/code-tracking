import { isUndefined, omitBy } from "lodash";
import { Types } from "mongoose";

export interface IService {
  _id?: string;
  name: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Service implements IService {
  _id?: string;
  name: string;
  createdAt?: Date;
  updatedAt?: Date;

  constructor(input?: IService) {
    this._id = input._id
      ? input._id.toString()
      : new Types.ObjectId().toString();
    this.name = input.name;
    this.createdAt = input.createdAt;
    this.updatedAt = input.updatedAt;
  }

  toJSON() {
    return omitBy(this, isUndefined);
  }
}
