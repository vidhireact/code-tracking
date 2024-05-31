import { Response } from "express";

import Joi from "joi";
import { get as _get } from "lodash";
import {
  getBusinessById,
  Business,
  saveBusiness,
  updateBusiness,
  getBusinessByUserId,
  getPopulatedBusiness,
  // deleteBusiness,
} from "../../modules/business";
import { Request } from "../../request";
import { getServiceById } from "../../modules/service";
import { getGrowthCollaborativeById } from "../../modules/growth-collaborative";
import { getLocationById } from "../../modules/location";
import { getPlanById } from "../../modules/plan";

export default class Controller {
  private readonly createSchema = Joi.object().keys({
    name: Joi.string().required(),
    description: Joi.string().required(),
    email: Joi.string().required(),
    phoneNumber: Joi.string()
      .pattern(/^\+([0-9]{1,3})\)?[\s]?[0-9]{6,14}$/)
      .required(),
    logo: Joi.string().required(),
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
    growthCollaborativeId: Joi.string()
      .required()
      .external(async (v: string) => {
        if (!v) return v;
        const growthCollaborative = await getGrowthCollaborativeById(v);
        if (!growthCollaborative) {
          throw new Error(
            "Please provide valid growthCollaborative for profile growthCollaborative."
          );
        }
        return v;
      }),
    locationIds: Joi.array()
      .required()
      .items(Joi.string())
      .external((value) => {
        if (!value) return;
        if (!value.length) return;
        value.map(async (item) => {
          const location = await getLocationById(item.toString());
          if (!location) throw new Error("Please provide valid location.");
        });
        return value;
      }),
    planIds: Joi.array()
      .required()
      .items(Joi.string())
      .external((value) => {
        if (!value) return;
        if (!value.length) return;
        value.map(async (item) => {
          const plan = await getPlanById(item.toString());
          if (!plan) throw new Error("Please provide valid Plan.");
        });
        return value;
      }),
  });

  private readonly updateSchema = Joi.object().keys({
    name: Joi.string().optional(),
    description: Joi.string().optional(),
    email: Joi.string().required(),
    phoneNumber: Joi.string()
      .pattern(/^\+([0-9]{1,3})\)?[\s]?[0-9]{6,14}$/)
      .required(),
    logo: Joi.string().optional(),
    service: Joi.string()
      .optional()
      .external(async (v: string) => {
        if (!v) return v;
        const service = await getServiceById(v);
        if (!service) {
          throw new Error("Please provide valid service for profile service.");
        }
        return v;
      }),
    locationIds: Joi.array()
      .optional()
      .items(Joi.string())
      .external((value) => {
        if (!value) return;
        if (!value.length) return;
        value.map(async (item) => {
          const location = await getLocationById(item.toString());
          if (!location) throw new Error("Please provide valid location.");
        });
        return value;
      }),
    planIds: Joi.array()
      .optional()
      .items(Joi.string())
      .external((value) => {
        if (!value) return;
        if (!value.length) return;
        value.map(async (item) => {
          const plan = await getPlanById(item.toString());
          if (!plan) throw new Error("Please provide valid Plan.");
        });
        return value;
      }),
  });

  protected readonly get = async (req: Request, res: Response) => {
    try {
      const { businessId } = req.params;
      const authUser = req.authUser;
      if (businessId) {
        const business = await getPopulatedBusiness(businessId);
        if (!business) {
          res.status(422).json({ message: "Invalid Business." });
          return;
        }
        res.status(200).json(business);
        return;
      }
      const businesses = await getBusinessByUserId(authUser._id.toString());
      res.status(200).json(businesses);
    } catch (error) {
      console.log("error", "error in get admin business", error);
      res.status(500).json({
        message: "Hmm... Something went wrong. Please try again later.",
        error: _get(error, "message"),
      });
    }
  };

  protected readonly create = async (req: Request, res: Response) => {
    try {
      const payload = req.body;
      const authUser = req.authUser;
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

      const business = await saveBusiness(
        new Business({
          ...payloadValue,
          userId: authUser._id.toString(),
        })
      );

      const newBusiness = await getBusinessById(business._id);
      res.status(200).json(newBusiness);
    } catch (error) {
      console.log("error", "error in create business", error);
      res.status(500).json({
        message: "Hmm... Something went wrong. Please try again later.",
        error: _get(error, "message"),
      });
    }
  };

  protected readonly update = async (req: Request, res: Response) => {
    try {
      const payload = req.body;
      const authUser = req.authUser;
      const { businessId } = req.params;
      if (!businessId) {
        res.status(422).json({ message: "Invalid Business." });
        return;
      }
      const business = await getBusinessById(businessId);
      if (!business) {
        res.status(422).json({ message: "Invalid Business." });
        return;
      }

      if (business.userId.toString() !== authUser._id.toString()) {
        res.status(401).json({ message: "Unauthorized." });
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

      const updatedBusiness = await updateBusiness(
        new Business({ ...business.toJSON(), ...payloadValue })
      );

      res.status(200).json(updatedBusiness);
    } catch (error) {
      console.log("error", "error in Updating Business", error);
      res.status(500).json({
        message: "Hmm... Something went wrong. Please try again later.",
        error: _get(error, "message"),
      });
    }
  };

  protected readonly delete = async (req: Request, res: Response) => {
    try {
      const authUser = req.authUser;
      const { businessId } = req.params;
      if (!businessId) {
        res.status(422).json({ message: "Invalid Business." });
        return;
      }
      const business = await getBusinessById(businessId);
      if (!business) {
        res.status(422).json({ message: "Invalid Business." });
        return;
      }

      if (business.userId.toString() !== authUser._id.toString()) {
        res.status(401).json({ message: "Unauthorized." });
        return;
      }

      // await deleteBusiness(businessId);
      res.status(200).json({ message: "Business is Deleted Successfully. " });
    } catch (error) {
      console.log("error", "error in Deleting Business", error);
      res.status(500).json({
        message: "Hmm... Something went wrong. Please try again later.",
        error: _get(error, "message"),
      });
    }
  };
}
