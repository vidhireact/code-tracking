import { Business, BusinessModel } from "../";

export const getPopulatedBusinessAdmin = async (_id: string) => {
  const business: Business = await BusinessModel.findById(_id)
    .populate({
      path: "serviceIds",
      select: "-__v",
    })
    .populate({
      path: "planIds",
      select: "-__v",
    })
    .populate({
      path: "growthCollaborativeId",
      select: "-__v",
    })
    .populate({
      path: "locationIds",
      select: "-__v",
    })
    .populate({
      path: "serviceIds",
      select: "-__v",
    })
    .populate({
      path: "waitWhileUserId",
      select: "-__v",
    });

  return business ? new Business(business) : null;
};
