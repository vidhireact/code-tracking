import { Types } from "mongoose";
import { GrowthCollaborativeModel } from "./schema";
import { getPopulatedPreferredLocationById } from "../preferred-location";
import { IUser } from "../user";

export const getGrowthCollaborativeByServiceArray = async ({
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
    const preferredLocation = await getPopulatedPreferredLocationById(
      user.preferredLocationId.toString()
    );
  
    const skip = (page - 1) * limit;
  
    const plans = await GrowthCollaborativeModel.aggregate([
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
                service: { $in: serviceId.map((id) => new Types.ObjectId(id)) },
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
                    },
                  },
                ],
              },
            },
          ],
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