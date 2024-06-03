import { PreferredLocation, PreferredLocationModel } from ".";

export const savePreferredLocation = async (
  preferredLocation: PreferredLocation
) => {
  await new PreferredLocationModel(preferredLocation.toJSON()).save();
  return preferredLocation ? new PreferredLocation(preferredLocation) : null;
};
