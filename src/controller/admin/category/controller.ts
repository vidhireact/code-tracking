import axios from "axios";
import { Response } from "express";
import { Request } from "express";
import Joi from "joi";
import { get as _get } from "lodash";
import {
  Category,
  getCategory,
  getCategoryById,
  getCategoryByName,
  saveCategory,
  updateCategory,
} from "../../../modules/category";

export default class Controller {
  private readonly createSchema = Joi.object().keys({
    name: Joi.string()
      .required()
      .external(async (v: string) => {
        if (!v) return v;

        const category = await getCategoryByName(v);

        if (category) {
          throw new Error("Please provide valid category-name.");
        }
        return v;
      }),
  });

  private readonly updateSchema = Joi.object().keys({
    name: Joi.string()
      .optional()
      .external(async (v: string) => {
        const category = await getCategoryByName(v);

        if (category) {
          throw new Error("Please provide valid category-name.");
        }
        return v;
      }),
  });

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

  protected readonly create = async (req: Request, res: Response) => {
    try {
      const payload = req.body;

      const payloadValue = await this.createSchema
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
      const waitWhileApiKey = process.env.WAIT_WHILE_KEY;

      const option = {
        url: `${process.env.WAITWHILE_BASE_URL}/services`,
        method: "POST",
        headers: {
          accept: "application/json",
          "content-type": "application/json",
          apikey: `${waitWhileApiKey}`,
        },
        data: JSON.stringify({
          name: payloadValue.name,
          locationIds: [process.env.WAIT_WHILE_BUSINESS_ID],
        }),
      };

      const response = await axios(option);

      const service = await saveCategory(
        new Category({
          ...payloadValue,
          waitWhileCategoryId: response.data.id,
        })
      );

      const newService = await getCategoryById(service._id);
      res.status(200).json(newService);
    } catch (error) {
      console.log("error", "error in create category", error);
      res.status(500).json({
        message: "Hmm... Something went wrong. Please try again later.",
        error: _get(error, "message"),
      });
    }
  };

  protected readonly update = async (req: Request, res: Response) => {
    try {
      const payload = req.body;
      const { categoryId } = req.params;
      if (!categoryId) {
        res.status(422).json({ message: "Invalid categoryId." });
        return;
      }
      const category = await getCategoryById(categoryId);
      if (!category) {
        res.status(422).json({ message: "Invalid categoryId." });
        return;
      }

      const waitWhileApiKey = process.env.WAIT_WHILE_KEY;

      const option = {
        url: `${process.env.WAITWHILE_BASE_URL}/services/${category.waitWhileCategoryId}`,
        method: "GET",
        headers: {
          accept: "application/json",
          "content-type": "application/json",
          apikey: `${waitWhileApiKey}`,
        },
      };

      const response = await axios(option);

      const data = Array.from(response.data.locationIds);

      if (data.length > 1) {
        res.status(422).json({ message: "category already used" });
        return;
      }

      const payloadValue = await this.updateSchema
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
      const updateDetails = await updateCategory(
        new Category({ ...category.toJSON(), ...payloadValue })
      );

      res.status(200).json(updateDetails);
    } catch (error) {
      console.log("error", "error in update category", error);
      res.status(500).json({
        message: "Hmm... Something went wrong. Please try again later.",
        error: _get(error, "message"),
      });
    }
  };
}
