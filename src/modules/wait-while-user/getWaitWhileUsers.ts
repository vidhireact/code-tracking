import { waitWhileUserModel } from "./schema";

export const getWaitWhileUsers = async () => {
    const users = await waitWhileUserModel.find();
    return users;
}