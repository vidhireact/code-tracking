import { isUndefined, omitBy } from "lodash";
import { Types } from "mongoose";
import { IPreferredLocation } from "../../preferred-location";
import { IPlan } from "../../plan";

/* export enum genderType {
  MALE = "MALE",
  FEMALE = "FEMALE",
  OTHER = "OTHER",
  NOT_SPECIFIED = "NOT_SPECIFIED",
} */

export interface IUser {
  _id?: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  isPhoneVerified?: boolean;

  email: string;
  isEmailVerified?: boolean;

  password?: string;

  address?: string;
  latitude?: number;
  longitude?: number;

  selectedRadius?: number;

  profilePic?: string; // TODO Image

  userType?: string;
  preferredLocationId?: string | IPreferredLocation;

  likedPlan?: (string | IPlan)[];
 
  createdAt?: Date;
  updatedAt?: Date;

  isSocialLogin?: boolean;
  isGoogleLogin?: boolean;
  isFacebookLogin?: boolean;
  isAppleLogin?: boolean;
}

export interface UserDefaults {
  isEmailVerified: false;
  isPhoneVerified: false;
  userType: "USER";
}

export class User implements IUser {
  _id?: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  isPhoneVerified?: boolean;

  email: string;
  isEmailVerified?: boolean;

  password?: string;

  address?: string;
  latitude?: number;
  longitude?: number;

  selectedRadius?: number;

  profilePic?: string; // TODO Image

  userType?: string;
  preferredLocationId: string | IPreferredLocation;
  likedPlan?: (string | IPlan)[];

  createdAt?: Date;
  updatedAt?: Date;

  isSocialLogin?: boolean;
  isGoogleLogin?: boolean;
  isFacebookLogin?: boolean;
  isAppleLogin?: boolean;

  constructor(input?: IUser) {
    this._id = input._id
      ? input._id.toString()
      : new Types.ObjectId().toString();
    this.firstName = input.firstName;
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
    this.preferredLocationId = input.preferredLocationId;
    this.likedPlan = input.likedPlan;

    this.createdAt = input.createdAt;
    this.updatedAt = input.updatedAt;

    this.isSocialLogin = input.isSocialLogin;
    this.isGoogleLogin = input.isGoogleLogin;
    this.isFacebookLogin = input.isFacebookLogin;
    this.isAppleLogin = input.isAppleLogin;
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
