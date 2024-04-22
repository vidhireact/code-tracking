import { Subscription, SubscriptionModel } from ".";

export const getSubscriptionByServiceId = async (serviceId: string) => {
  const subscription = await SubscriptionModel.find({ serviceId });

  return subscription && subscription.length > 0
    ? subscription.map((item) => new Subscription(item))
    : [];
};
