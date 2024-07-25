import { WaitWhileUser } from "./types";
import { waitWhileUserModel } from "./schema";

export const updateWaitWhileUser = async (user: WaitWhileUser) => {
  await waitWhileUserModel.findByIdAndUpdate(user._id, user.toJSON());
  return user;
};
