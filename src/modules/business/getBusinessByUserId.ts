import { Business, BusinessModel } from ".";

export const getBusinessByUserId = async (userId: string) => {
  const business = await BusinessModel.find({ userId });

  return business && business.length > 0
    ? business.map((item) => new Business(item))
    : [];
};
