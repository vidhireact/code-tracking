import { Business, BusinessModel } from ".";

export const updateBusiness = async (business: Business) => {
  await BusinessModel.findByIdAndUpdate(business._id, business.toJSON());
  return business ? new Business(business) : null;
};
