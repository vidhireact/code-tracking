import { Location, LocationModel } from ".";

export const saveLocation = async (location: Location) => {
  await new LocationModel(location.toJSON()).save();
  return location ? new Location(location) : null;
};
