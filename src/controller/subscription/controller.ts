import { Response } from "express";

import Joi from "joi";
import { get as _get } from "lodash";
import {
  getSubscriptionById,
  Subscription,
  saveSubscription,
  updateSubscription,
  getSubscriptionByUserId,
  getPopulatedSubscription,
  getBusinessBySubId,
  getBusinessById,
  // deleteSubscription,
} from "../../modules/subscription";
import { Request } from "../../request";
import { getServiceById } from "../../modules/service";
import { getPlanById } from "../../modules/plan";
import moment from "moment";

export default class Controller {
  private readonly createSchema = Joi.object().keys({
    serviceId: Joi.string()
      .required()
      .external(async (value: string) => {
        if (!value) return value; ̰
        const service = await getServiceById(value);
        if (!service) {
          throw new Error("Please provide valid service.");
        }
        return value;
      }),
    planId: Joi.string()
      .required()
      .external(async (value: string, helpers) => {
        const serviceId = helpers.state.ancestors[0].serviceId;

        if (!value) return;
        const plan = await getPlanById(value);
        if (!plan) {
          throw new Error("Please provide valid Plan.");
        }
        if (!plan.serviceId.find((item) => item.toString() === serviceId)) {
          throw new Error(
            "Please provide valid service related to plan / change plan."
          );
        }
        return value;
      }),
    // locationId: Joi.string()
    //   .required()
    //   .external(async (value: string) => {
    //     if (!value) return;
    //     const location = await getLocationById(value);
    //     if (!location) {
    //       throw new Error("Please provide valid location.");
    //     }
    //     return value;
    //   }),
  });

  private readonly updateSchema = Joi.object().keys({
    businessId: Joi.string()
      .required()
      .external(async (value: string) => {
        if (!value) return value;
        const service = await getBusinessById(value);
        if (!service) {
          throw new Error("Please provide valid Business.");
        }
        return value;
      }),
  });

  protected readonly get = async (req: Request, res: Response) => {
    try {
      const { subscriptionId } = req.params;
      const authUser = req.authUser;
      if (subscriptionId) {
        const subscription = await getPopulatedSubscription(subscriptionId);
        if (!subscription) {
          res.status(422).json({ message: "Invalid Subscription." });
          return;
        }
        res.status(200).json(subscription);
        return;
      }
      const subscriptions = await getSubscriptionByUserId(
        authUser._id.toString()
      );
      res.status(200).json(subscriptions);
    } catch (error) {
      console.log("error", "error in get admin subscription", error);
      res.status(500).json({
        message: "Hmm... Something went wrong. Please try again later.",
        error: _get(error, "message"),
      });
    }
  };

  protected readonly create = async (req: Request, res: Response) => {
    try {
      const payload = req.body;
      const authUser = req.authUser;
      const payloadValue = await this.createSchema
        .validateAsync(payload)
        .then((value) => {
          return value;
        })
        .catch((e) => {
          console.log(e);
          res.status(422).json({ message: e.message });
          return;
        });
      if (!payloadValue) {
        return;
      }

      const plan = await getPlanById(payloadValue.planId);

      const subscription = await saveSubscription(
        new Subscription({
          ...payloadValue,
          userId: authUser._id.toString(),
          startDate: moment(),
          endDate: moment().add(plan.duration, "d"),
        })
      );

      const newSubscription = await getSubscriptionById(subscription._id);
      res.status(200).json(newSubscription);
    } catch (error) {
      console.log("error", "error in create subscription", error);
      res.status(500).json({
        message: "Hmm... Something went wrong. Please try again later.",
        error: _get(error, "message"),
      });
    }
  };

  protected readonly update = async (req: Request, res: Response) => {
    try {
      const payload = req.body;
      const authUser = req.authUser;
      const { subscriptionId } = req.params;
      if (!subscriptionId) {
        res.status(422).json({ message: "Invalid Subscription." });
        return;
      }
      const subscription = await getSubscriptionById(subscriptionId);
      if (!subscription) {
        res.status(422).json({ message: "Invalid Subscription." });
        return;
      }

      if (subscription.associated || subscription.businessId) {
        res.status(422).json({ message: "Already Associated." });
        return;
      }
      if (subscription.userId.toString() !== authUser._id.toString()) {
        res.status(401).json({ message: "Unauthorized." });
        return;
      }

      const payloadValue = await this.updateSchema
        .validateAsync(payload)
        .then((value) => {
          return value;
        })
        .catch((e) => {
          console.log(e);
          res.status(422).json({ message: e.message });
          return;
        });
      if (!payloadValue) {
        return;
      }

      const plan = await getPlanById(subscription.planId.toString());
      if (!plan) {
        res.status(422).json({ message: "Plan closed." });
        return;
      }

      const business = await getBusinessById(payloadValue.businessId);
      if (!business) {
        res.status(422).json({ message: "Business closed." });
        return;
      }
      console.log({ business });
      if (
        !business.planIds.find(
          (item) => item.toString() === subscription.planId.toString()
        )
      ) {
        res.status(422).json({ message: "Business closed / Plan updated." });
        return;
      }

      const updatedSubscription = await updateSubscription(
        new Subscription({
          ...subscription.toJSON(),
          ...payloadValue,
          associated: true,
          associatedDate: moment(),
        })
      );

      res.status(200).json(updatedSubscription);
    } catch (error) {
      console.log("error", "error in Updating Subscription", error);
      res.status(500).json({
        message: "Hmm... Something went wrong. Please try again later.",
        error: _get(error, "message"),
      });
    }
  };

  protected readonly delete = async (req: Request, res: Response) => {
    try {
      const authUser = req.authUser;
      const { subscriptionId } = req.params;
      if (!subscriptionId) {
        res.status(422).json({ message: "Invalid Subscription." });
        return;
      }
      const subscription = await getSubscriptionById(subscriptionId);
      if (!subscription) {
        res.status(422).json({ message: "Invalid Subscription." });
        return;
      }

      if (subscription.userId.toString() !== authUser._id.toString()) {
        res.status(401).json({ message: "Unauthorized." });
        return;
      }

      // await deleteSubscription(subscriptionId);
      res
        .status(200)
        .json({ message: "Subscription is Deleted Successfully. " });
    } catch (error) {
      console.log("error", "error in Deleting Subscription", error);
      res.status(500).json({
        message: "Hmm... Something went wrong. Please try again later.",
        error: _get(error, "message"),
      });
    }
  };

  protected readonly getBusinessBySubscriptionId = async (
    req: Request,
    res: Response
  ) => {
    try {
      const { subscriptionId } = req.params;
      if (!subscriptionId) {
        res.status(422).json({ message: "Invalid Subscription." });
        return;
      }
      const subscription = await getSubscriptionById(subscriptionId);
      if (!subscription) {
        res.status(422).json({ message: "Invalid Subscription." });
        return;
      }

      const serviceId = subscription.serviceId as string;
      const planId = subscription.planId as string;

      const business = await getBusinessBySubId({
        serviceId,
        planId,
      });

      res.status(200).json(business);
    } catch (error) {
      console.log("error", "error in get Business by SubscriptionID", error);
      res.status(500).json({
        message: "Hmm... Something went wrong. Please try again later.",
        error: _get(error, "message"),
      });
    }
  };

  protected readonly getBusinessById = async (req: Request, res: Response) => {
    try {
      const { businessId } = req.params;
      if (!businessId) {
        res.status(422).json({ message: "Invalid Business." });
        return;
      }
      const business = await getBusinessById(businessId);
      if(!business){
        res.status(422).json({ message: "Invalid Subscription." });
        return;
      }

      res.status(200).json(business);
    } catch (error) {
      console.log("error", "error in get getBusinessById", error);
      res.status(500).json({
        message: "Hmm... Something went wrong. Please try again later.",
        error: _get(error, "message"),
      });
    }
  };
}
