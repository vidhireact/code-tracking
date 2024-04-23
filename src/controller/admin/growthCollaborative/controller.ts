import { Response } from "express";

import Joi from "joi";
import { get as _get } from "lodash";
import {
  getGrowthCollaborative,
  getGrowthCollaborativeById,
  GrowthCollaborative,
  saveGrowthCollaborative,
  updateGrowthCollaborative,
  // deleteGrowthCollaborative,
} from "../../../modules/growth-collaborative";
import { Request } from "../../../request";
import { getServiceById } from "../../../modules/service";

export default class Controller {
  private readonly createSchema = Joi.object().keys({
    name: Joi.string().required(),
    description: Joi.string().required(),
    keyFeatures: Joi.string().required(),
    percentage: Joi.string().required(),
    service: Joi.string()
      .required()
      .external(async (v: string) => {
        if (!v) return v;
        const service = await getServiceById(v);
        if (!service) {
          throw new Error("Please provide valid service for profile service.");
        }
        return v;
      }),
  });
  private readonly updateSchema = Joi.object().keys({
    name: Joi.string().optional(),
    description: Joi.string().optional(),
    keyFeatures: Joi.string().optional(),
    percentage: Joi.string().optional(),
  });

  protected readonly get = async (req: Request, res: Response) => {
    const GrowthCollaborativeId = req.params._id;
    if (GrowthCollaborativeId) {
      const growthCollaborative = await getGrowthCollaborativeById(
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

      const growthCollaborative = await saveGrowthCollaborative(
        new GrowthCollaborative({
          ...payloadValue,
        })
      );

      const newGrowthCollaborative = await getGrowthCollaborativeById(
        growthCollaborative._id
      );
      res.status(200).json(newGrowthCollaborative);
    } catch (error) {
      console.log("error", "error in create growthCollaborative", error);
      res.status(500).json({
        message: "Hmm... Something went wrong. Please try again later.",
        error: _get(error, "message"),
      });
    }
  };

  protected readonly update = async (req: Request, res: Response) => {
    try {
      const payload = req.body;
      const growthCollaborativeId = req.params._id;
      if (!growthCollaborativeId) {
        res.status(422).json({ message: "Invalid GrowthCollaborative." });
        return;
      }
      const growthCollaborative = await getGrowthCollaborativeById(
        growthCollaborativeId
      );
      if (!growthCollaborative) {
        res.status(422).json({ message: "Invalid GrowthCollaborative." });
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

      const updatedGrowthCollaborative = await updateGrowthCollaborative(
        new GrowthCollaborative({
          ...growthCollaborative.toJSON(),
          ...payloadValue,
        })
      );

      res.status(200).json(updatedGrowthCollaborative);
    } catch (error) {
      console.log("error", "error in Updating GrowthCollaborative", error);
      res.status(500).json({
        message: "Hmm... Something went wrong. Please try again later.",
        error: _get(error, "message"),
      });
    }
  };

  protected readonly delete = async (req: Request, res: Response) => {
    try {
      const growthCollaborativeId = req.params._id;
      if (!growthCollaborativeId) {
        res.status(422).json({ message: "Invalid GrowthCollaborative." });
        return;
      }
      const growthCollaborative = await getGrowthCollaborativeById(
        growthCollaborativeId
      );
      if (!growthCollaborative) {
        res.status(422).json({ message: "Invalid GrowthCollaborative." });
        return;
      }
      // await deleteGrowthCollaborative(growthCollaborativeId);
      res
        .status(200)
        .json({ message: "GrowthCollaborative is Deleted Successfully. " });
    } catch (error) {
      console.log("error", "error in Deleting GrowthCollaborative", error);
      res.status(500).json({
        message: "Hmm... Something went wrong. Please try again later.",
        error: _get(error, "message"),
      });
    }
  };
}
