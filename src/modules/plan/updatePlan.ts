import { Plan, PlanModel } from ".";

export const updatePlan = async (plan: Plan) => {
  await PlanModel.findByIdAndUpdate(plan._id, plan.toJSON());
  return plan ? new Plan(plan) : null;
};
