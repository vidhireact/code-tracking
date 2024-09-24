import { Plan, PlanModel } from ".";

export const getPopulatedPlan = async (_id: string) => {
  const plan: Plan = await PlanModel.findById(_id).populate({
    path: "serviceId",
    select: "-__v",
  });

  return plan ? new Plan(plan) : null;
};
