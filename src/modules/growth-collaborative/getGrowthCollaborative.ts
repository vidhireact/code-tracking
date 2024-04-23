import { GrowthCollaborativeModel, GrowthCollaborative } from ".";

export const getGrowthCollaborative = async () => {
  const growthCollaborative = await GrowthCollaborativeModel.find().lean();
  return growthCollaborative && growthCollaborative.length
    ? growthCollaborative.map((item) => new GrowthCollaborative(item))
    : [];
};
