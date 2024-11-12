import { Response } from "express";
import { get as _get } from "lodash";
import {
  getGrowthCollaborativeByServiceArray,
  getPopulatedGrowthCollaborativeById,
} from "../../modules/growth-collaborative";
import { Request } from "../../request";
import { getServiceById } from "../../modules/service";
import Joi from "joi";
import { getPlanById } from "../../modules/plan";
import {
  Business,
  getBusinessById,
  updateBusiness,
} from "../../modules/business";

export default class Controller {
  private readonly validatePlanSchema = Joi.object().keys({
    planIds: Joi.array()
      .required()
      .items(Joi.string())
      .external(async (value) => {
        if (!value) return;
        if (!value.length) return;
        const allServices = new Set();
        let priceSum = 0;
        for await (const item of value) {
          const plan = await getPlanById(item);
          if (!plan) {
            throw new Error("Please provide valid Plan.");
          }
          priceSum += plan.price;
          plan.serviceId.forEach((service) =>
            allServices.add(service.toString())
          );
        }
        return {
          planIds: value,
          priceSum: priceSum,
          allServices: Array.from(allServices),
        };
      }),
    serviceIds: Joi.array()
      .required()
      .items(Joi.string())
      .external(async (value) => {
        if (!value) return;
        if (!value.length) return;
        for await (const item of value) {
          const service = await getServiceById(item);
          if (!service) {
            throw new Error("Please provide valid service.");
          }
        }
        return value;
      }),
  });

  private readonly validateSelectGrothCollabrative = Joi.object().keys({
    businessId: Joi.string()
      .required()
      .external(async (v) => {
        if (!v) throw new Error("Please provide valid BusinessId.");
        const business = await getBusinessById(v);
        if (!business) {
          throw new Error("Please provide valid BusinessId.");
        }
        return v;
      }),
    grothCollabrativeId: Joi.string().optional(),
  });

  protected readonly get = async (req: Request, res: Response) => {
    try {
      const { growthCollaborativeId } = req.params;
      if (!growthCollaborativeId) {
        res.status(422).json({ message: "Invalid GrowthCollaborative." });
        return;
      }
      const growthCollaborative = await getPopulatedGrowthCollaborativeById(
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
      const payload = req.body;
      const payloadValue = await this.validatePlanSchema
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

      const serviceId = payloadValue.serviceIds;
      const priceSum = payloadValue.planIds.priceSum;

      const plans = await getGrowthCollaborativeByServiceArray({
        page: 1,
        limit: 20,
        serviceId,
        priceSum,
      });

      res.status(200).json(plans);
    } catch (error) {
      console.log("error", "error in get plan by service id", error);
      res.status(500).json({
        message: "Hmm... Something went wrong. Please try again later.",
        error: _get(error, "message"),
      });
    }
  };

  protected readonly getGrowthCollaborativeByBusinessId = async (
    req: Request,
    res: Response
  ) => {
    try {
      const { businessId } = req.params;
      if (!businessId) {
        res.status(422).json({ message: "Invalid BusinessID." });
        return;
      }
      const businessDetails = await getBusinessById(businessId);
      if (!businessDetails) {
        res.status(422).json({ message: "Invalid Business." });
        return;
      }

      const planIds = businessDetails.planIds;
      const serviceId = businessDetails.serviceIds as string[];

      const priceSum = await planIds.reduce(async (accPromise, val: string) => {
        const acc = await accPromise;
        const plan = await getPlanById(val);

        if (!plan) {
          throw new Error("Please provide valid Plan.");
        }

        return acc + plan.price;
      }, Promise.resolve(0));

      console.log("Total Price:", priceSum);

      const plans = await getGrowthCollaborativeByServiceArray({
        page: 1,
        limit: 20,
        serviceId,
        priceSum,
      });

      res.status(200).json(plans);
    } catch (error) {
      console.log(
        "error",
        "error in get growthCollaborative by businessId",
        error
      );
      res.status(500).json({
        message: "Hmm... Something went wrong. Please try again later.",
        error: _get(error, "message"),
      });
    }
  };

  protected readonly selectGrothCollabrative = async (
    req: Request,
    res: Response
  ) => {
    try {
      const payload = req.body;
      const payloadValue = await this.validateSelectGrothCollabrative
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

      const business = await getBusinessById(payloadValue.businessId);

      const updatedBusiness = await updateBusiness(
        new Business({
          ...business,
          growthCollaborativeId: payloadValue.grothCollabrativeId,
        })
      );

      res.status(200).json(updatedBusiness);
    } catch (error) {
      console.log("error", "error in selectGrothCollabrative.", error);
      res.status(500).json({
        message: "Hmm... Something went wrong. Please try again later.",
        error: _get(error, "message"),
      });
    }
  };
}
