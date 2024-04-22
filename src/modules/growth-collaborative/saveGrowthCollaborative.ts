import { GrowthCollaborative, GrowthCollaborativeModel } from ".";

export const saveGrowthCollaborative = async (growthCollaborative: GrowthCollaborative) => {
  await new GrowthCollaborativeModel(growthCollaborative.toJSON()).save();
  return growthCollaborative ? new GrowthCollaborative(growthCollaborative) : null;
};
