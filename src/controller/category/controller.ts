import { Response } from "express";
import { get as _get } from "lodash";
import { getCategory, getCategoryById } from "../../modules/category";
import { Request } from "../../request";

export default class Controller {
  protected readonly get = async (req: Request, res: Response) => {
    try {
      const { categoryId } = req.params;
      if (categoryId) {
        const category = await getCategoryById(categoryId);
        if (!category) {
          res.status(422).json({ message: "Invalid category." });
          return;
        }
        res.status(200).json(category);
        return;
      }
      const category = await getCategory();
      res.status(200).json(category);
    } catch (error) {
      console.log("error", "error in get category", error);
      res.status(500).json({
        message: "Hmm... Something went wrong. Please try again later.",
        error: _get(error, "message"),
      });
    }
  };
}
