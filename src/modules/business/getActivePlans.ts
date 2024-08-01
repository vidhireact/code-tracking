import { Types } from "mongoose";
import { PlanModel } from "../plan";
import { IUser } from "../user";

export const getActivePlans = async ({
  page,
  limit,
  serviceId,
  user,
}: {
  user: IUser;
  page: number;
  limit: number;
  serviceId: string[];
}) => {
  const skip = (page - 1) * limit;

  const plans = await PlanModel.aggregate([
    {
      $lookup: {
        from: "businesses",
        localField: "_id",
        foreignField: "planIds",
        as: "businessIds",
        pipeline: [
          {
            $match: {
              userId: { $ne: new Types.ObjectId(user._id) },
            },
          },
          {
            $match: {
              serviceIds: {
                $in: serviceId.map((id) => new Types.ObjectId(id)),
              },
            },
          },
        ],
      },
    },
    {
      $match: {
        serviceId: { $all: serviceId.map((id) => new Types.ObjectId(id)) },
      },
    },
    {
      $match: { businessIds: { $gt: [{ $size: "$businessIds" }, 0] } },
    },
    {
      $project: {
        _id: 1,
        name: 1,
        description: 1,
        keyFeatures: 1,
        price: 1,
        duration: 1,
        visits: 1,
        createdAt: 1,
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
