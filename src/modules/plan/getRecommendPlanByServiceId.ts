import { Types } from "mongoose";
import { PlanModel } from ".";
import { getPopulatedPreferredLocationById } from "../preferred-location";
import { IUser } from "../user";

export const getRecommendPlanByServiceId = async ({
  page,
  limit,
  serviceId,
  user,
}: {
  user: IUser;
  page: number;
  limit: number;
  serviceId: string;
}) => {
  const preferredLocation = await getPopulatedPreferredLocationById(
    user.preferredLocationId.toString()
  );

  const skip = (page - 1) * limit ? (page - 1) * limit : 0;

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
              serviceIds: { $eq: new Types.ObjectId(serviceId) },
            },
          },
          {
            $lookup: {
              from: "locations",
              localField: "locationIds",
              foreignField: "_id",
              as: "locationIds",
              pipeline: [
                {
                  $addFields: {
                    distance: {
                      $multiply: [
                        {
                          $radiansToDegrees: {
                            $acos: {
                              $add: [
                                {
                                  $multiply: [
                                    {
                                      $sin: {
                                        $degreesToRadians:
                                          preferredLocation.latitude,
                                      },
                                    },
                                    {
                                      $sin: {
                                        $degreesToRadians: "$latitude",
                                      },
                                    },
                                  ],
                                },
                                {
                                  $multiply: [
                                    {
                                      $cos: {
                                        $degreesToRadians: {
                                          $subtract: [
                                            preferredLocation.longitude,
                                            "$longitude",
                                          ],
                                        },
                                      },
                                    },
                                    {
                                      $cos: {
                                        $degreesToRadians:
                                          preferredLocation.latitude,
                                      },
                                    },
                                    {
                                      $cos: {
                                        $degreesToRadians: "$latitude",
                                      },
                                    },
                                  ],
                                },
                              ],
                            },
                          },
                        },
                        111.18957696,
                      ],
                    },
                  },
                },
                {
                  $match: {
                    distance: {
                      $lt: preferredLocation.range
                        ? preferredLocation.range
                        : 10,
                    },
                  },
                },
                {
                  $sort: {
                    distance: 1,
                  },
                },
                {
                  $project: {
                    name: 1,
                    address: 1,
                    email: 1,
                    scheduleLink: 1,
                    website: 1,
                    phoneNumber: 1,
                    distance: 1,
                    locationIds: 1,
                  },
                },
              ],
            },
          },
        ],
      },
    },
    {
      $match: {
        $expr: {
          $gt: [{ $size: "$businessIds" }, 0],
        },
      },
    },
    {
      $match: {
        $expr: {
          $gt: [
            {
              $size: {
                $filter: {
                  input: "$businessIds",
                  as: "business",
                  cond: { $gt: [{ $size: "$$business.locationIds" }, 0] },
                },
              },
            },
            0,
          ],
        },
      },
    },
    {
      $match: {
        serviceId: { $eq: new Types.ObjectId(serviceId) },
      },
    },
    {
      $project: {
        _id: 1,
        name: 1,
        description: 1,
        keyFeatures: 1,
        price: 1,
        duration: 1,
        serviceId: 1,
        visits: 1,
        createdAt: 1,
      },
    },
    {
      $skip: skip,
    },
    {
      $limit: 20,
    },
  ]);

  const planIds = plans.map(plan => plan._id); // Get IDs of existing plans

  const recommendPlans = await PlanModel.find({
    serviceId: new Types.ObjectId(serviceId),
    _id: { $nin: planIds }, // Exclude existing plans
    // Add any additional conditions here if needed
    isActive: true, // Example condition
  })
  .select({
    _id: 1,
    name: 1,
    description: 1,
    keyFeatures: 1,
    price: 1,
    duration: 1,
    serviceId: 1,
    visits: 1,
    createdAt: 1,
  })
  .skip(skip) // Pagination
  .limit(20); // Limit the number of results
  

  return recommendPlans;
};
