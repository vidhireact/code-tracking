import { Response } from "express";
import axios from "axios";
import Joi from "joi";
import { get as _get } from "lodash";
import {
  getBusinessById,
  Business,
  saveBusiness,
  updateBusiness,
  getBusinessByUserId,
  getPopulatedBusiness,
  getActivePlans,
  // deleteBusiness,
} from "../../modules/business";
import { Request } from "../../request";
import { getServiceById } from "../../modules/service";
import { getGrowthCollaborativeById } from "../../modules/growth-collaborative";
import { getLocationById } from "../../modules/location";
import { getPlanById } from "../../modules/plan";
import {
  WaitWhileUser,
  saveWaitWhileUser,
  getWaitWhileUserByEmail,
  updateWaitWhileUser,
} from "../../modules/waitWhileUser";
import { AES } from "crypto-js";

export default class Controller {
  private readonly waitWhileUserSchema = Joi.object().keys({
    name: Joi.string().required(),
    email: Joi.string()
      .email()
      .required()
      .external(async (v: string) => {
        if (!v) return v;
        const checkEmail = await getWaitWhileUserByEmail(v);
        if (checkEmail) {
          throw new Error("Please provide valid waitWhile User Email");
        }
        return v;
      }),
    password: Joi.string()
      .required()
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/),
    roles: Joi.array()
      .items(
        Joi.string().valid("admin", "editor", "reader", "owner").lowercase()
      )
      .required()
      .max(4),
  });
  private readonly createSchema = Joi.object().keys({
    name: Joi.string().required(),
    description: Joi.string().required(),
    email: Joi.string().email().required(),
    phoneNumber: Joi.string()
      .pattern(/^\+([0-9]{1,3})\)?[\s]?[0-9]{6,14}$/)
      .required(),
    logo: Joi.string().required(),
    serviceIds: Joi.array().items(
      Joi.string().external(async (v: string) => {
        if (!v) return v;
        const service = await getServiceById(v);
        if (!service) {
          throw new Error("Please provide valid  service.");
        }
        return v;
      })
    ),
    growthCollaborativeId: Joi.string()
      .required()
      .external(async (v: string, helpers) => {
        if (!v) return v;
        const growthCollaborative = await getGrowthCollaborativeById(v);
        if (!growthCollaborative) {
          throw new Error("Please provide valid growthCollaborative.");
        }
        const serviceId = helpers.state.ancestors[0].serviceIds;
        if (
          !serviceId.some((id) => growthCollaborative.serviceId.includes(id))
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
        const serviceId = helpers.state.ancestors[0].serviceIds;
        if (!value) return;
        if (!value.length) return;
        for await (const item of value) {
          const plan = await getPlanById(item);
          if (!plan) {
            throw new Error("Please provide valid Plan.");
          } else {
            if (!serviceId.every((id) => plan.serviceId.includes(id))) {
              throw new Error("Please provide valid service related to plan.");
            }
          }
        }
        return value;
      }),
    waitWhileUser: this.waitWhileUserSchema,
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

  private readonly activePlansArray = Joi.object().keys({
    serviceIds: Joi.array().items(Joi.string()),
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

      const waitWhileApiKey = process.env.WAIT_WHILE_KEY;

      const options = {
        url: `${process.env.WAITWHILE_BASE_URL}/locations?includeUsers=false&includeLabels=false&includeResources=false&includeServices=false&includeDataFields=false&makeDefault=false`,
        method: "POST",
        headers: {
          accept: "application/json",
          "content-type": "application/json",
          apikey: `${waitWhileApiKey}`,
        },
        data: JSON.stringify({
          labels: [],
          name: payloadValue.name,
          isBookingActive: true,
          isPublicBooking: true,
        }),
      };

      const response = await axios(options);

      const detailUser = payloadValue.waitWhileUser;

      for (const id of payloadValue.serviceIds) {
        const serviceDetails = await getServiceById(id);
        if (!serviceDetails.waitWhileServiceId) {
          res.status(422).json({ message: "Invalid WaitWhile Service." });
          return;
        }
        const options = {
          url: `${process.env.WAITWHILE_BASE_URL}/services/${serviceDetails.waitWhileServiceId}`,
          method: "POST",
          headers: {
            accept: "application/json",
            "content-type": "application/json",
            apikey: `${waitWhileApiKey}`,
          },
          data: JSON.stringify({
            addLocationIds: response.data.id,
          }),
        };
        await axios(options);
      }

      const option = {
        url: `${process.env.WAITWHILE_BASE_URL}/users`,
        method: "POST",
        headers: {
          accept: "application/json",
          "content-type": "application/json",
          apikey: `${waitWhileApiKey}`,
        },
        data: JSON.stringify({
          name: detailUser.name,
          email: detailUser.email,
          password: detailUser.password,
          locationIds: [response.data.id],
          roles: detailUser.roles,
        }),
      };

      await axios(option);

      const password = AES.encrypt(
        payloadValue.waitWhileUser.password,
        process.env.AES_KEY
      ).toString();

      await saveWaitWhileUser(
        new WaitWhileUser({
          ...payloadValue.waitWhileUser,
          password: password,
        })
      ).catch((e) => {
        console.log(e);
        res.status(422).json({ message: e.message });
        return;
      });

      const getWaitWhileUser = await getWaitWhileUserByEmail(
        payloadValue.waitWhileUser.email
      );

      const business = await saveBusiness(
        new Business({
          ...payloadValue,
          waitWhileUserId: [getWaitWhileUser._id],
          waitWhileLocationId: response.data.id,
          waitWhileScheduleLink: response.data.shortName,
          userId: authUser._id.toString(),
        })
      );

      await updateWaitWhileUser(
        new WaitWhileUser({
          ...getWaitWhileUser,
          businessId: business._id,
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

      const waitWhileApiKey = process.env.WAIT_WHILE_KEY;

      const options = {
        url: `${process.env.WAITWHILE_BASE_URL}/locations/${business.waitWhileLocationId}`,
        method: "POST",
        headers: {
          accept: "application/json",
          "content-type": "application/json",
          apikey: `${waitWhileApiKey}`,
        },
        data: JSON.stringify({
          name: payloadValue.name,
        }),
      };

      const response = await axios(options);

      const updatedBusiness = await updateBusiness(
        new Business({
          ...business.toJSON(),
          waitWhileScheduleLink: response.data.shortName,
          ...payloadValue,
        })
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

  protected readonly activePlans = async (req: Request, res: Response) => {
    try {
      const authUser = req.authUser;
      const payload = req.body;

      const payloadValue = await this.activePlansArray
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

      const plans = await getActivePlans({
        page: 1,
        limit: 20,
        serviceId,
        user: authUser,
      });

      res.status(200).json(plans);
    } catch (error) {
      console.log(
        "error",
        "error in get business plan's by service id's",
        error
      );
      res.status(500).json({
        message: "Hmm... Something went wrong. Please try again later.",
        error: _get(error, "message"),
      });
    }
  };
}
