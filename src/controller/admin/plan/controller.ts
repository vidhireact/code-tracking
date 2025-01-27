import { Response } from "express";

import Joi from "joi";
import { get as _get } from "lodash";
import {
  getPlan,
  getPlanById,
  getPopulatedPlan,
  Plan,
  savePlan,
  updatePlan,
  // deletePlan,
} from "../../../modules/plan";
import { Request } from "../../../request";
import { getServiceById } from "../../../modules/service";

export default class Controller {
  private readonly createSchema = Joi.object().keys({
    name: Joi.string().required(),
    description: Joi.string().required(),
    keyFeatures: Joi.string().required(),
    price: Joi.number().required(),
    duration: Joi.number().required(),
    visits: Joi.number().required(),
    serviceIds: Joi.array()
      .items(Joi.string())
      .required()
      .external(async (value: [string]) => {
        if (!value) throw new Error("Please provide valid service.");
        if (!value.length) throw new Error("Please provide valid service.");
        for await (const item of value) {
          const service = await getServiceById(item);
          if (!service) {
            throw new Error("Please provide valid service.");
          }
        }
        return value;
      }),
  });
  private readonly updateSchema = Joi.object().keys({
    name: Joi.string().optional(),
    description: Joi.string().optional(),
    keyFeatures: Joi.string().optional(),
    price: Joi.number().optional(),
    duration: Joi.number().optional(),
    visits: Joi.number().optional(),
    // service: Joi.string()
    //   .optional()
    //   .external(async (v: string) => {
    //     if (!v) return v;
    //     const service = await getServiceById(v);
    //     if (!service) {
    //       throw new Error("Please provide valid service for profile service.");
    //     }
    //     return v;
    //   }),
  });

  protected readonly get = async (req: Request, res: Response) => {
    try {
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
    } catch (error) {
      console.log("error", "error in get admin plan", error);
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

      const plan = await savePlan(
        new Plan({
          ...payloadValue,
        })
      );

      const newPlan = await getPlanById(plan._id);
      res.status(200).json(newPlan);
    } catch (error) {
      console.log("error", "error in create plan", error);
      res.status(500).json({
        message: "Hmm... Something went wrong. Please try again later.",
        error: _get(error, "message"),
      });
    }
  };

  protected readonly update = async (req: Request, res: Response) => {
    try {
      const payload = req.body;
      const { planId } = req.params;
      if (!planId) {
        res.status(422).json({ message: "Invalid Plan." });
        return;
      }
      const plan = await getPlanById(planId);
      if (!plan) {
        res.status(422).json({ message: "Invalid Plan." });
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

      const updatedPlan = await updatePlan(
        new Plan({ ...plan.toJSON(), ...payloadValue })
      );

      res.status(200).json(updatedPlan);
    } catch (error) {
      console.log("error", "error in Updating Plan", error);
      res.status(500).json({
        message: "Hmm... Something went wrong. Please try again later.",
        error: _get(error, "message"),
      });
    }
  };

  protected readonly delete = async (req: Request, res: Response) => {
    try {
      const { planId } = req.params;
      if (!planId) {
        res.status(422).json({ message: "Invalid Plan." });
        return;
      }
      const plan = await getPlanById(planId);
      if (!plan) {
        res.status(422).json({ message: "Invalid Plan." });
        return;
      }

      // await deletePlan(planId);
      res.status(200).json({ message: "Plan is Deleted Successfully. " });
    } catch (error) {
      console.log("error", "error in Deleting Plan", error);
      res.status(500).json({
        message: "Hmm... Something went wrong. Please try again later.",
        error: _get(error, "message"),
      });
    }
  };
}
