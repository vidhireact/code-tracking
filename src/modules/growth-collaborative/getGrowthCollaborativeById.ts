import { GrowthCollaborative, GrowthCollaborativeModel } from ".";

export const getGrowthCollaborativeById = async (_id: string) => {
  const growthCollaborative = await GrowthCollaborativeModel.findById(_id);

  return growthCollaborative ? new GrowthCollaborative(growthCollaborative) : null;
};
