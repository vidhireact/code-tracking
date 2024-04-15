import { User } from ".";
import { UserModel } from "./schema";

/**
 *
 * @param email user email
 * @returns null or User class
 */
export const getUserByEmail = async (email: string) => {
  const user = await UserModel.findOne({ email });
  return user ? new User(user) : null;
};
