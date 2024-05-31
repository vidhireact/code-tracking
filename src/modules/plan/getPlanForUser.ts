import { PlanModel, Plan } from ".";

export const getPlanForUser = async () => {
  const plan = await PlanModel.find().lean();
  return plan && plan.length ? plan.map((item) => new Plan(item)) : [];
};
