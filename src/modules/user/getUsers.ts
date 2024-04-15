import { User } from ".";
import { UserModel } from "./schema";

/**
 *
 * @returns User[]
 */
export const getUsers = async () => {
  const users = await UserModel.find().sort({ _id: -1 });
  return users && users.length ? users.map((user) => new User(user)) : [];
};
