import { User } from ".";
import { UserModel } from "./schema";

/**
 *
 * @param email user email
 * @returns null or User class
 */
export const getUserByNumber = async (phoneNumber: string) => {
  const user = await UserModel.findOne({ phoneNumber });
  return user ? new User(user) : null;
};
