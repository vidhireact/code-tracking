import { Subscription, SubscriptionModel } from ".";

export const getPopulatedSubscription = async (_id: string) => {
  const subscription: Subscription = await SubscriptionModel.findById(_id)
    .populate({
      path: "userId",
      select: "-__v",
    })
    .populate({
      path: "planId",
      select: "-__v",
    })
    .populate({
      path: "businessId",
      select: "-__v",
    })
    .populate({
      path: "locationId",
      select: "-__v",
    })
    .populate({
      path: "serviceId",
      select: "-__v",
    });

  return subscription ? new Subscription(subscription) : null;
};
