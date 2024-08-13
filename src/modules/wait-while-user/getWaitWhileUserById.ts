import { WaitWhileUser } from "./types"; 
import { waitWhileUserModel } from "./schema";

export const getWaitWhileUserById = async (_id: string) => {
    const user = await waitWhileUserModel.findById(_id);

    return user ? new WaitWhileUser(user) : null;
}