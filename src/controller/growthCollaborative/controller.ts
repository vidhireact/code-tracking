import { Response } from "express";
import { get as _get } from "lodash";
import {
  getGrowthCollaborativeByServiceId,
  getGrowthCollaborativeForUser,
  getPopulatedGrowthCollaborative,
} from "../../modules/growth-collaborative";
import { Request } from "../../request";

export default class Controller {
  protected readonly get = async (req: Request, res: Response) => {
    try {
      const { growthCollaborativeId } = req.params;
      if (!growthCollaborativeId) {
        res.status(422).json({ message: "Invalid GrowthCollaborative." });
        return;
      }
      const growthCollaborative = await getPopulatedGrowthCollaborative(
        growthCollaborativeId
      );
      if (!growthCollaborative) {
        res.status(422).json({ message: "Invalid GrowthCollaborative." });
        return;
      }
      res.status(200).json(growthCollaborative);
      return;
    } catch (error) {
      console.log("error", "error in get growthCollaborative", error);
      res.status(500).json({
        message: "Hmm... Something went wrong. Please try again later.",
        error: _get(error, "message"),
      });
    }
  };

  protected readonly getGrowthCollaborativeByServiceId = async (
    req: Request,
    res: Response
  ) => {
    try {
      const { serviceId } = req.params;

      if (!serviceId) {
        const plans = await getGrowthCollaborativeForUser();
        res.status(200).json(plans);
        return;
      } else {
        const plans = await getGrowthCollaborativeByServiceId(serviceId);
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
