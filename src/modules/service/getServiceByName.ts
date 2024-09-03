import { ServiceModel } from ".";
/**
 *
 * @param name service Name
 * @returns return service by Name
 */
export const getServiceByName = async (name: string) => {
  const service = await ServiceModel.findOne({ name });

  return service;
};
