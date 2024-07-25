import { Business, BusinessModel } from ".";

export const getBusinessById = async (_id: string) => {
  const business = await BusinessModel.findById(_id);

  return business ? new Business(business) : null;
};
