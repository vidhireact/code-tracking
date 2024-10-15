import { Response } from "express";
import { get as _get, uniqBy as _uniqBy } from "lodash";
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

        if(!serviceDetails){
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
}
