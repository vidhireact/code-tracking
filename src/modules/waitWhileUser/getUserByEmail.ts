import { waitwhileUser } from "./types"; 
import { waitWhileUserModel } from "./schema";

export const getWaitWhileUserByEmail = async (email: string) => {
    const user = await waitWhileUserModel.findOne({
        email: email
    });
    return user ? new waitwhileUser(user) : null;
}