import { WaitWhileUser } from "./types";
import { waitWhileUserModel } from "./schema";

export const getWaitWhileUserByBusinessId = async (businessId: string) => {
  const user = await waitWhileUserModel.find({
    businessId,
  });

  return user && user.length > 0
    ? user.map((item) => new WaitWhileUser(item))
    : [];
};
