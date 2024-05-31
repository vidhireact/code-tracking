import { Response } from "express";
import { get as _get } from "lodash";
import {
  getPlanByServiceId,
  getPlanForUser,
  getPopulatedPlan,
} from "../../modules/plan";
import { Request } from "../../request";

export default class Controller {
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

  protected readonly getPlanByServiceId = async (
    req: Request,
    res: Response
  ) => {
    try {
      const { serviceId } = req.params;

      if (!serviceId) {
        const plans = await getPlanForUser();
        res.status(200).json(plans);
        return;
      } else {
        const plans = await getPlanByServiceId(serviceId);
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
}
