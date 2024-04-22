import { Service, ServiceModel } from ".";

export const saveService = async (service: Service) => {
  await new ServiceModel(service.toJSON()).save();
  return service ? new Service(service) : null;
};
