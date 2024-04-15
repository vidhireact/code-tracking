import { Request as expresesRequest } from "express";
import { IUser } from "./modules/user";
import { FileReference } from "typescript";

export interface Request extends expresesRequest {
  files: FileReference;
  authUser: IUser;
  isAdmin: boolean;
}
