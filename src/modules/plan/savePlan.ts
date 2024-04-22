import { Plan, PlanModel } from ".";

export const savePlan = async (plan: Plan) => {
  await new PlanModel(plan.toJSON()).save();
  return plan ? new Plan(plan) : null;
};
