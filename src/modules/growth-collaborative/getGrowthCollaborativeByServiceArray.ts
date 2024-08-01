import { Types } from "mongoose";
import { GrowthCollaborativeModel } from "./schema";

export const getGrowthCollaborativeByServiceArray = async ({
  page,
  limit,
  serviceId,
  priceSum,
}: {
  page: number;
  limit: number;
  serviceId: string[];
  priceSum: string;
}) => {
  const skip = (page - 1) * limit;

  const plans = await GrowthCollaborativeModel.aggregate([
    {
      $match: {
        cutOFF: { $gt: priceSum },
        serviceId: { $in: serviceId.map((id) => new Types.ObjectId(id)) },
      },
    },
    {
      $skip: skip,
    },
    {
      $limit: limit,
    },
  ]);

  return plans;
};
