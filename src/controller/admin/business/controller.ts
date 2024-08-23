import { Response } from "express";
import { get as _get } from "lodash";
import { Request } from "../../../request";
import {
  getBusiness,
  getPopulatedBusinessAdmin,
} from "../../../modules/business";

export default class Controller {
  protected readonly get = async (req: Request, res: Response) => {
    try {
      const { businessId } = req.params;
      if (businessId) {
        const business = await getPopulatedBusinessAdmin(businessId);
        if (!business) {
          res.status(422).json({ message: "Invalid Business." });
          return;
        }
        res.status(200).json(business);
        return;
      }
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 15;

      const business = await getBusiness(page, limit);
      res.status(200).json(business);
    } catch (error) {
      console.log("error", "error in get admin getBusiness", error);
      res.status(500).json({
        message: "Hmm... Something went wrong. Please try again later.",
        error: _get(error, "message"),
      });
    }
  };
}
