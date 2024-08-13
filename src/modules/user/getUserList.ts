import { UserModel } from "./schema";
import { omit } from "lodash";

export const getUserList = async (page, limit) => {
  const skip = (page - 1) * limit;

  const users = await UserModel.find({ userType: { $ne: "ADMIN" } })
    .skip(skip)
    .limit(limit)
    .sort({ _id: -1 });

  const usersWithoutPassword = users.map((users) => {
    return omit(users.toObject(), "password");
  });

  return usersWithoutPassword;
};
