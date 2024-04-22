import { Subscription, SubscriptionModel } from ".";

export const updateSubscription = async (subscription: Subscription) => {
  await SubscriptionModel.findByIdAndUpdate(subscription._id, subscription.toJSON());
  return subscription ? new Subscription(subscription) : null;
};
