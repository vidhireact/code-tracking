import { Plan, PlanModel } from ".";

export const getPopulatedPlan = async (_id: string) => {
  const plan: Plan = await PlanModel.findById(_id).populate({
    path: "serviceIds",
    select: "-__v",
  });

  return plan ? new Plan(plan) : null;
};
