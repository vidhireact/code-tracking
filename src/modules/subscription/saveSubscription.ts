import { Subscription, SubscriptionModel } from ".";

export const saveSubscription = async (subscription: Subscription) => {
  await new SubscriptionModel(subscription.toJSON()).save();
  return subscription ? new Subscription(subscription) : null;
};
