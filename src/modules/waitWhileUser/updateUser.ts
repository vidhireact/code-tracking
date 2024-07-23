import { waitwhileUser } from "./types"; 
import { waitWhileUserModel } from "./schema";

export const updateWaitWhileUser = async (user: waitwhileUser) => {
    await waitWhileUserModel.findByIdAndUpdate(user._id, user.toJSON());
    return user;
}