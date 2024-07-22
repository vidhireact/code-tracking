import { Response } from "express";
import * as fs from "fs";
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
  private readonly waitWhileUserSchema = Joi.object().keys({
    email: Joi.string().email().required(),
    password: Joi.string()
    .required()
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/),
      roles: Joi.array().items(Joi.string()).required()
  });
  private readonly createSchema = Joi.object().keys({
    name: Joi.string().required(),
    description: Joi.string().required(),
    email: Joi.string().email().required(),
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
          throw new Error("Please provide valid  service.");
        }
        return v;
      }),
    growthCollaborativeId: Joi.string()
      .required()
      .external(async (v: string, helpers) => {
        if (!v) return v;
        const growthCollaborative = await getGrowthCollaborativeById(v);
        if (!growthCollaborative) {
          throw new Error("Please provide valid growthCollaborative.");
        }
        const serviceId = helpers.state.ancestors[0].service;
        if (
          !growthCollaborative.serviceId.find(
            (item) => item.toString() === serviceId
          )
        ) {
          throw new Error(
            "Please provide valid service related to growthCollaborative plan."
          );
        }
        return v;
      }),
    locationIds: Joi.array()
      .required()
      .items(Joi.string())
      .external(async (value) => {
        if (!value) return;
        if (!value.length) return;
        for await (const item of value) {
          const location = await getLocationById(item);
          if (!location) {
            throw new Error("Please provide valid location.");
          }
        }
        return value;
      }),
    planIds: Joi.array()
      .required()
      .items(Joi.string())
      .external(async (value, helpers) => {
        const serviceId = helpers.state.ancestors[0].service;
        if (!value) return;
        if (!value.length) return;
        for await (const item of value) {
          const plan = await getPlanById(item);
          if (!plan) {
            throw new Error("Please provide valid Plan.");
          } else {
            if (!plan.serviceId.find((item) => item.toString() === serviceId)) {
              throw new Error("Please provide valid service related to plan.");
            }
          }
        }
        return value;
      }),
      waitWhileUser: Joi.array().items(this.waitWhileUserSchema)
  });

  private readonly updateSchema = Joi.object().keys({
    name: Joi.string().optional(),
    description: Joi.string().optional(),
    email: Joi.string().required(),
    phoneNumber: Joi.string()
      .pattern(/^\+([0-9]{1,3})\)?[\s]?[0-9]{6,14}$/)
      .required(),
    logo: Joi.string().optional(),
    locationIds: Joi.array()
      .optional()
      .items(Joi.string())
      .external(async (value) => {
        if (!value) return;
        if (!value.length) return;
        for await (const item of value) {
          const location = await getLocationById(item);
          if (!location) {
            throw new Error("Please provide valid location.");
          }
        }
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

      console.log(payloadValue);

      const waitwhileApiKey = '1c6CW3wuUHnRReC5tAHq9V0L';
      
      const options = {
        method: "POST",
        headers: {
          accept: "application/json",
          "content-type": "application/json",
          apikey: `${waitwhileApiKey}`,
        },
        body: JSON.stringify({
          labels: [],
          name: payloadValue.name,
          isBookingActive: true,
          isPublicBooking: true,
        }),
      };

        const response = await fetch(
          "https://api.waitwhile.com/v2/locations?includeUsers=false&includeLabels=false&includeResources=false&includeServices=false&includeDataFields=false&makeDefault=false",
          options
        ); 
        const responseLocation = await response.json();
        console.log(responseLocation.id);
      
      const detailUser = payloadValue.waitWhileUser[0];

      console.log(detailUser);
      

      const user = await fetch(
        "https://api.waitwhile.com/v2/users",
        {
          method: "POST",
          headers: {
            accept: "application/json",
            "content-type": "application/json",
            apikey: `${waitwhileApiKey}`,
          },
          body: JSON.stringify({
            email: detailUser.email,
            password: detailUser.password,
            locationIds: [responseLocation.id],
            roles: detailUser.roles
          })
        }
      )

      const responseUser = await user.json();
      console.log(responseUser);
      

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
