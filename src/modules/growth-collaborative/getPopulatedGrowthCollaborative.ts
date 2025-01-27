import { GrowthCollaborativeModel } from ".";

export const getPopulatedGrowthCollaborative = async () => {
  const growthCollaborative = await GrowthCollaborativeModel.find().populate({
    path: "serviceIds",
    select: "-__v",
  });

  return growthCollaborative;
};
