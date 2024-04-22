import { Business, BusinessModel } from ".";

export const saveBusiness = async (business: Business) => {
  await new BusinessModel(business.toJSON()).save();
  return business ? new Business(business) : null;
};
