import { Service, ServiceModel } from ".";

export const updateService = async (service: Service) => {
  await ServiceModel.findByIdAndUpdate(service._id, service.toJSON());
  return service ? new Service(service) : null;
};
