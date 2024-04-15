import { isUndefined, omitBy } from "lodash";
import { Types } from "mongoose";

export enum genderType {
  MALE = "MALE",
  FEMALE = "FEMALE",
  OTHER = "OTHER",
  NOT_SPECIFIED = "NOT_SPECIFIED",
}

export interface IUser {
  _id?: string;
  fistName: string;
  lastName: string;
  phoneNumber?: string;
  isPhoneVerified?: boolean;

  email: string;
  isEmailVerified?: boolean;

  password: string;

  address?: string;
  latitude?: number;
  longitude?: number;

  selectedRadius?: number;

  profilePic?: string; // TODO Image

  userType: string;

  createdAt?: Date;
  updatedAt?: Date;
}

export interface UserDefaults {
  isEmailVerified: false;
  isPhoneVerified: false;
  userType: "USER";
}

export class User implements IUser {
  _id?: string;
  fistName: string;
  lastName: string;
  phoneNumber: string;
  isPhoneVerified?: boolean;

  email: string;
  isEmailVerified?: boolean;

  password: string;

  address?: string;
  latitude?: number;
  longitude?: number;

  selectedRadius?: number;

  profilePic?: string; // TODO Image

  userType: string;

  createdAt?: Date;
  updatedAt?: Date;

  constructor(input?: IUser) {
    this._id = input._id
      ? input._id.toString()
      : new Types.ObjectId().toString();
    this.fistName = input.fistName;
    this.lastName = input.lastName;
    this.phoneNumber = input.phoneNumber;
    this.isPhoneVerified = input.isPhoneVerified;

    this.email = input.email;
    this.isEmailVerified = input.isEmailVerified;

    this.password = input.password;

    this.address = input.address;
    this.latitude = input.latitude;
    this.longitude = input.longitude;

    this.selectedRadius = input.selectedRadius;

    this.profilePic = input.profilePic;

    this.userType = input.userType;

    this.createdAt = input.createdAt;
    this.updatedAt = input.updatedAt;
  }

  static adminTypes = ["ADMIN"];

  static defaults: UserDefaults = {
    isEmailVerified: false,
    isPhoneVerified: false,
    userType: "USER",
  };

  toJSON(): IUser {
    return omitBy(this, isUndefined) as IUser;
  }
}
