import { GrowthCollaborative, GrowthCollaborativeModel } from ".";

export const getGrowthCollaborativeByServiceId = async (serviceId: string) => {
  const growthCollaborative = await GrowthCollaborativeModel.find({ serviceId });

  return growthCollaborative && growthCollaborative.length > 0
    ? growthCollaborative.map((item) => new GrowthCollaborative(item))
    : [];
};
