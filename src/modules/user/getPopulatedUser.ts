import { omit } from "lodash";
import { IUser, User } from ".";
import { UserModel } from "./schema";

/**
 *
 * @param _id user _id
 * @returns return populated account
 */
export const getPopulatedUser = async (_id: string) => {
  const user: IUser = await UserModel.findById(_id).populate({
    path: "billingAddressId",
    select: "-__v",
  });

  return user
    ? // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      new User(omit(user, ["password"]))
    : null;
};
