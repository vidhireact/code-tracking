import { PreferredLocation, PreferredLocationModel } from ".";

export const getPreferredLocationById = async (_id: string) => {
  const preferredLocation = await PreferredLocationModel.findById(_id);

  return preferredLocation ? new PreferredLocation(preferredLocation) : null;
};
