import { Subscription, SubscriptionModel } from ".";

export const getSubscriptionByUserId = async (userId: string) => {
  const subscription = await SubscriptionModel.find({ userId });

  return subscription && subscription.length > 0
    ? subscription.map((item) => new Subscription(item))
    : [];
};
