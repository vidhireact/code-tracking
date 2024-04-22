import { GrowthCollaborative, GrowthCollaborativeModel } from ".";

export const updateGrowthCollaborative = async (growthCollaborative: GrowthCollaborative) => {
  await GrowthCollaborativeModel.findByIdAndUpdate(growthCollaborative._id, growthCollaborative.toJSON());
  return growthCollaborative ? new GrowthCollaborative(growthCollaborative) : null;
};
