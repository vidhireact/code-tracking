import { GrowthCollaborative, GrowthCollaborativeModel } from ".";
// getPopulatedGrowthCollaborative
export const getPopulatedGrowthCollaborativeById = async (_id: string) => {
  const growthCollaborative: GrowthCollaborative = await GrowthCollaborativeModel.findById(
    _id
  ).populate({
    path: "service",
    select: "-__v",
  });

  return growthCollaborative ? new GrowthCollaborative(growthCollaborative) : null;
};
