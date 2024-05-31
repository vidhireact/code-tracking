import { Response } from "express";
import { get as _get } from "lodash";
import { getPlan, getPopulatedPlan } from "../../modules/plan";
import { Request } from "../../request";

export default class Controller {
  protected readonly get = async (req: Request, res: Response) => {
    const { planId } = req.params;
    if (planId) {
      const plan = await getPopulatedPlan(planId);
      if (!plan) {
        res.status(422).json({ message: "Invalid Plan." });
        return;
      }
      res.status(200).json(plan);
      return;
    }
    const plans = await getPlan();
    res.status(200).json(plans);
  };
}
