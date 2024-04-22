import { LocationModel, Location } from ".";

export const getLocation = async () => {
  const location = await LocationModel.find().lean();
  return location && location.length
    ? location.map((item) => new Location(item))
    : [];
};
