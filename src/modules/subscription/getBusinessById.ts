import { Business, BusinessModel } from "../business";

export const getBusinessById = async (_id: string) => {
  const business = await BusinessModel.findById(_id)
    .populate({
      path: "locationIds",
      select: "-__v",
    })
    .populate({
        path:"serviceIds",
        select:"-__v",
    });

  return business ? new Business(business) : null;
};
