import { ServiceModel, Service } from ".";

export const getService = async () => {
  const service = await ServiceModel.find().lean();
  return service && service.length
    ? service.map((item) => new Service(item))
    : [];
};
