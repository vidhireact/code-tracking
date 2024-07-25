import { Types } from "mongoose";
import { isUndefined, omitBy } from "lodash";
import { IBusiness } from "../../business";

export interface IWaitWhileUser {
  _id?: string;
  name: string;
  email: string;
  password: string;
  businessId: string | IBusiness;
  roles: [string];
}

export class WaitWhileUser implements IWaitWhileUser {
  _id?: string;
  name: string;
  email: string;
  password: string;
  businessId: string | IBusiness;
  roles: [string];

  constructor(input?: IWaitWhileUser) {
    this._id = input._id
      ? input._id.toString()
      : new Types.ObjectId().toString();
    this.name = input.name;
    this.email = input.email;
    this.password = input.password;
    this.businessId = input.businessId;
    this.roles = input.roles;
  }

  toJSON(): IWaitWhileUser {
    return omitBy(this, isUndefined) as IWaitWhileUser;
  }
}
