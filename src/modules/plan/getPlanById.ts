import { Plan, PlanModel } from ".";

export const getPlanById = async (_id: string) => {
  const plan = await PlanModel.findById(_id);

  return plan ? new Plan(plan) : null;
};
