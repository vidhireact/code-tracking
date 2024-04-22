import { Service, ServiceModel } from ".";

export const getServiceById = async (_id: string) => {
  const service = await ServiceModel.findById(_id);

  return service ? new Service(service) : null;
};
