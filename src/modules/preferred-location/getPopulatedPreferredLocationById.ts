import { PreferredLocation, PreferredLocationModel } from ".";

export const getPopulatedPreferredLocationById = async (_id: string) => {
  const preferredLocation = await PreferredLocationModel.findById(_id).populate(
    {
      path: "serviceId",
      select: "-__v",
    }
  );
  return preferredLocation ? new PreferredLocation(preferredLocation) : null;
};
