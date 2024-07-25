import { WaitWhileUser } from "./types";
import { waitWhileUserModel } from "./schema";

export const saveWaitWhileUser = async (user: WaitWhileUser) => {
  await new waitWhileUserModel(user.toJSON()).save();
  return WaitWhileUser;
};
