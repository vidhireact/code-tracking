import { Subscription, SubscriptionModel } from ".";

export const getSubscriptionById = async (_id: string) => {
  const subscription = await SubscriptionModel.findById(_id);

  return subscription ? new Subscription(subscription) : null;
};
