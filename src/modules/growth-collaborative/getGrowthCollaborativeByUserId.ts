import { GrowthCollaborative, GrowthCollaborativeModel } from ".";

export const getGrowthCollaborativeByUserId = async (userId: string) => {
  const growthCollaborative = await GrowthCollaborativeModel.find({ userId });

  return growthCollaborative && growthCollaborative.length > 0
    ? growthCollaborative.map((item) => new GrowthCollaborative(item))
    : [];
};
