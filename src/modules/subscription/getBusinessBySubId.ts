import { Types } from "mongoose";
import { BusinessModel } from "../business";

export const getBusinessBySubId = async ({
  serviceId,
  planId,
}: {
  serviceId: string;
  planId: string;
}) => {
  const business = await BusinessModel.aggregate([
    {
      $match: {
        serviceIds: { $in: [new Types.ObjectId(serviceId)] },
        planIds: { $in: [new Types.ObjectId(planId)] },
      },
    },
    {
      $project: {
        _id: 1,
        name: 1,
        description: 1,
        logo: 1,
      },
    },
  ]);

  return business;
};
