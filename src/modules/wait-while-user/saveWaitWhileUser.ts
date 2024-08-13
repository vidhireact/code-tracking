import { WaitWhileUser , waitWhileUserModel} from ".";

export const saveWaitWhileUser = async (user: WaitWhileUser) => {
  await new waitWhileUserModel(user.toJSON()).save();
  return WaitWhileUser;
};
