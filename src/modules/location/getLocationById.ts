import { Location, LocationModel } from ".";

export const getLocationById = async (_id: string) => {
  const location = await LocationModel.findById(_id);

  return location ? new Location(location) : null;
};
