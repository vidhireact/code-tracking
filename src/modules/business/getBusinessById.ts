import { Business, BusinessModel } from ".";

export const getBusinessById = async (_id: string) => {
  const business = await BusinessModel.findById(_id).lean();

  return business ? new Business(business) : null;
};
