import { waitwhileUser } from "./types"; 
import { waitWhileUserModel } from "./schema";

export const saveWaitWhileUser = async (user: waitwhileUser) => {
    await new waitWhileUserModel(user.toJSON()).save();
    return waitwhileUser
}