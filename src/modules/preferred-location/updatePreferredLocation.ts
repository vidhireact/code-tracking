import { PreferredLocation, PreferredLocationModel } from ".";

export const updatePreferredLocation = async (
  preferredLocation: PreferredLocation
) => {
  await PreferredLocationModel.findByIdAndUpdate(
    preferredLocation._id,
    preferredLocation.toJSON()
  );
  return preferredLocation ? new PreferredLocation(preferredLocation) : null;
};
