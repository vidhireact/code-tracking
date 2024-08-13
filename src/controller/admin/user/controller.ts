import { Response } from "express";
import { get as _get } from "lodash";
import { Request } from "../../../request";
import { getUserList } from "../../../modules/user";

export default class Controller {
  protected readonly get = async (req: Request, res: Response) => {
    try {
      const limit = Number(req.query.limit) || 15;
      const page = Number(req.query.page) || 1;

      const user = await getUserList(page, limit);

      res.status(200).json(user);
    } catch (error) {
      console.log("error", "error in get getUserList", error);
      res.status(500).json({
        message: "Hmm... Something went wrong. Please try again later.",
        error: _get(error, "message"),
      });
    }
  };
}
