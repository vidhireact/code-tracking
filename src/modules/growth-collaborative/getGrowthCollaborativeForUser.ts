import { GrowthCollaborativeModel, GrowthCollaborative } from ".";

export const getGrowthCollaborativeForUser = async () => {
  const plan = await GrowthCollaborativeModel.find().lean();
  return plan && plan.length
    ? plan.map((item) => new GrowthCollaborative(item))
    : [];
};
