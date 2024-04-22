import { Location, LocationModel } from ".";

export const getLocationByUserId = async (userId: string) => {
  const location = await LocationModel.find({ userId });

  return location && location.length > 0
    ? location.map((item) => new Location(item))
    : [];
};
