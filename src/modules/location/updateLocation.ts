import { Location, LocationModel } from ".";

export const updateLocation = async (location: Location) => {
  await LocationModel.findByIdAndUpdate(location._id, location.toJSON());
  return location ? new Location(location) : null;
};
