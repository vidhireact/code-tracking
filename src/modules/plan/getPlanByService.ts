import { Plan, PlanModel } from ".";

export const getPlanByServiceId = async (serviceId: string) => {
  const plan = await PlanModel.find({
    serviceId: { $in: serviceId },
  }).select(" -serviceId -createdAt -updatedAt");
  return plan && plan.length > 0 ? plan.map((item) => new Plan(item)) : [];
};
