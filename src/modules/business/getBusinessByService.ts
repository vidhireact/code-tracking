import { Business, BusinessModel } from ".";

export const getBusinessByServiceId = async (serviceId: string) => {
  const business = await BusinessModel.find({ serviceId });

  return business && business.length > 0
    ? business.map((item) => new Business(item))
    : [];
};
