import { Response } from "express";
import { get as _get } from "lodash";
import {
  getGrowthCollaborative,
  getPopulatedGrowthCollaborative,
} from "../../modules/growth-collaborative";
import { Request } from "../../request";

export default class Controller {
  protected readonly get = async (req: Request, res: Response) => {
    const GrowthCollaborativeId = req.params._id;
    if (GrowthCollaborativeId) {
      const growthCollaborative = await getPopulatedGrowthCollaborative(
        GrowthCollaborativeId
      );
      if (!growthCollaborative) {
        res.status(422).json({ message: "Invalid GrowthCollaborative." });
        return;
      }
      res.status(200).json(growthCollaborative);
      return;
    }
    const growthCollaboratives = await getGrowthCollaborative();
    res.status(200).json(growthCollaboratives);
  };
}
