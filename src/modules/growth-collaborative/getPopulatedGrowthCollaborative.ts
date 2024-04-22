import { GrowthCollaborative, GrowthCollaborativeModel } from ".";

export const getPopulatedGrowthCollaborative = async (_id: string) => {
  const growthCollaborative: GrowthCollaborative = await GrowthCollaborativeModel.findById(
    _id
  ).populate({
    path: "service",
    select: "-__v",
  });

  return growthCollaborative ? new GrowthCollaborative(growthCollaborative) : null;
};
