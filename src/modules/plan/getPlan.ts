import { PlanModel, Plan } from ".";

export const getPlan = async () => {
  const plan = await PlanModel.find().lean();
  return plan && plan.length
    ? plan.map((item) => new Plan(item))
    : [];
};
