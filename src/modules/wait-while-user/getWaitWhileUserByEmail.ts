import { WaitWhileUser } from "./types";
import { waitWhileUserModel } from "./schema";

export const getWaitWhileUserByEmail = async (email: string) => {
  const waitWhileUser = await waitWhileUserModel.findOne({ email });
  return waitWhileUser ? new WaitWhileUser(waitWhileUser) : null;
};
