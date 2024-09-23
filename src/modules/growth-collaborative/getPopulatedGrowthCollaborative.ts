import { GrowthCollaborativeModel } from ".";

export const getPopulatedGrowthCollaborative = async () => {
  const growthCollaborative = await GrowthCollaborativeModel.find().populate({
    path: "service",
    select: "-__v",
  });

  return growthCollaborative;
};
