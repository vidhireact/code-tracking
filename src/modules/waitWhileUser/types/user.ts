import { Types } from "mongoose";
import { IBusiness } from "../../business";

export interface waitWhileIUser {
    _id?: string;
    email: string;
    password: string;
    businessId: string | IBusiness;
    roles: [string]
}

export class waitwhileUser implements waitWhileIUser {
    _id?: string;
    email: string;
    password: string;
    businessId: string | IBusiness;
    roles: [string]

    constructor(input?: waitWhileIUser) {
        this._id = input._id
        ? input._id.toString()
            : new Types.ObjectId().toString();
        this.email = input.email;
        this.password = input.password;
        this.businessId = input.businessId;
        this.roles = input.roles;
    }
}