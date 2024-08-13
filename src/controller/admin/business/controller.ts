import { Response } from "express";
import { get as _get } from "lodash";
import { Request } from "../../../request";
import { getBusiness } from "../../../modules/business";

export default class Controller {
  protected readonly get = async (req: Request, res: Response) => {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 15;

      const business = await getBusiness(page, limit);
      res.status(200).json(business);
    } catch (error) {
      console.log("error", "error in get getBusiness", error);
      res.status(500).json({
        message: "Hmm... Something went wrong. Please try again later.",
        error: _get(error, "message"),
      });
    }
  };
}
