import { Response } from "express";
import { get as _get, uniqBy as _uniqBy, includes as _includes, without as _without } from "lodash";
import {
  Plan,
  getActivePlanByServiceId,
  getPlanById,
  getPlanForUser,
  getPopulatedPlan,
  getRecommendPlanByServiceId,
  updatePlan,
} from "../../modules/plan";
import { getServiceById } from "../../modules/service";
import { Request } from "../../request";
import { User, updateUser } from "../../modules/user";
import Joi from "joi";
import {
  Business,
  getBusinessById,
  updateBusiness,
} from "../../modules/business";

export default class Controller {
  private readonly updateLikedPlanSchema = Joi.object().keys({
    planId: Joi.string()
      .required()
      .external(async (value: string) => {
        if (!value) throw new Error("Please provide valid plan.");
        const plan = await getPlanById(value);
        if (!plan) {
          throw new Error("Please provide valid plan.");
        }
        return value;
      }),
  });

  private readonly updateCheckPlanSchema = Joi.object().keys({
    businessId: Joi.string()
      .required()
      .external(async (v) => {
        if (!v) throw new Error("Please provide valid BusinessID.");
        const business = await getBusinessById(v);
        if (!business) {
          throw new Error("Please provide valid BusinessID.");
        }
        return v;
      }),
    planIds: Joi.array()
      .required()
      .items(Joi.string())
      .external(async (value) => {
        if (!value) return;
        if (!value.length) return;
        for await (const item of value) {
          const plan = await getPlanById(item);
          if (!plan) {
            throw new Error("Please provide valid Plan.");
          }
        }
        return value;
      }),
  });

  protected readonly get = async (req: Request, res: Response) => {
    try {
      const { planId } = req.params;
      if (!planId) {
        res.status(422).json({ message: "Invalid Plan." });
        return;
      }
      const plan = await getPopulatedPlan(planId);
      if (!plan) {
        res.status(422).json({ message: "Invalid Plan." });
        return;
      }
      res.status(200).json(plan);
      return;
    } catch (error) {
      console.log("error", "error in get plan", error);
      res.status(500).json({
        message: "Hmm... Something went wrong. Please try again later.",
        error: _get(error, "message"),
      });
    }
  };

  protected readonly getActivePlanByServiceId = async (
    req: Request,
    res: Response
  ) => {
    try {
      const authUser = req.authUser;
      const { serviceId } = req.params;

      if (!serviceId) {
        const plans = await getPlanForUser();
        res.status(200).json(plans);
        return;
      } else {
        const serviceDetails = await getServiceById(serviceId);

        if (!serviceDetails) {
          res.status(422).json({ message: "Invalid service." });
          return;
        }

        const plans = await getActivePlanByServiceId({
          page: 1,
          limit: 20,
          serviceId,
          user: authUser,
        });

        res.status(200).json(plans);
        return;
      }
    } catch (error) {
      console.log("error", "error in get plan by service id", error);
      res.status(500).json({
        message: "Hmm... Something went wrong. Please try again later.",
        error: _get(error, "message"),
      });
    }
  };

  protected readonly getRecommendByServiceId = async (
    req: Request,
    res: Response
  ) => {
    try {
      const authUser = req.authUser;
      const { serviceId } = req.params;
      if (!serviceId) {
        const plans = await getPlanForUser();
        res.status(200).json(plans);
        return;
      } else {
        const plans = await getRecommendPlanByServiceId({
          page: 1,
          limit: 20,
          serviceId,
          user: authUser,
        });

        res.status(200).json(plans);
        return;
      }
    } catch (error) {
      console.log("error", "error in get plan by service id", error);
      res.status(500).json({
        message: "Hmm... Something went wrong. Please try again later.",
        error: _get(error, "message"),
      });
    }
  };

  protected readonly updateLikedPlan = async (req: Request, res: Response) => {
    try {
      const authUser = req.authUser;
      const payload = req.body;
      const payloadValue = await this.updateLikedPlanSchema
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

      if(_includes(plan.likedBy, authUser._id.toString())){
        await updatePlan(
          new Plan({
            ...plan,
            likedBy: _without(plan.likedBy, authUser._id.toString()
            ),
          })
        );

        await updateUser(
          new User({
            ...authUser,
            likedPlan: _without(
              authUser.likedPlan, plan._id.toString()
            ),
          })
        );

        res.status(200).json({ message: "Plan unLiked." });
      }

      await updatePlan(
        new Plan({
          ...plan,
          likedBy: _uniqBy([...plan.likedBy, authUser._id.toString()], (_id) =>
            _id.toString()
          ),
        })
      );

      await updateUser(
        new User({
          ...authUser,
          likedPlan: _uniqBy(
            [...authUser.likedPlan, plan._id.toString()],
            (_id) => _id.toString()
          ),
        })
      );

      res.status(200).json({ message: "Plan Liked." });
    } catch (error) {
      console.log("error", "error in get plan by service id", error);
      res.status(500).json({
        message: "Hmm... Something went wrong. Please try again later.",
        error: _get(error, "message"),
      });
    }
  };

  protected readonly updateCheckPlan = async (req: Request, res: Response) => {
    try {
      const payload = req.body;
      const payloadValue = await this.updateCheckPlanSchema
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

      const business = await getBusinessById(payloadValue.businessId);

      const updatedBusiness = await updateBusiness(
        new Business({
          ...business,
          planIds: _uniqBy(
            [...business.planIds, ...payloadValue.planIds],
            (id) => id.toString()
          ),
        })
      );

      res.status(200).json(updatedBusiness);
    } catch (error) {
      console.log("error", "error in check plan.", error);
      res.status(500).json({
        message: "Hmm... Something went wrong. Please try again later.",
        error: _get(error, "message"),
      });
    }
  };
}
