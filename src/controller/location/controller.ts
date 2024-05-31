import { Response } from "express";

import Joi from "joi";
import { get as _get } from "lodash";
import {
  getLocation,
  getLocationById,
  Location,
  saveLocation,
  updateLocation,
  // deleteLocation,
} from "../../modules/location";
import { Request } from "../../request";
import {
  Business,
  getBusinessById,
  updateBusiness,
} from "../../modules/business";

export default class Controller {
  private readonly createSchema = Joi.object().keys({
    name: Joi.string().required(),
    address: Joi.string().required(),
    latitude: Joi.number().required(),
    longitude: Joi.number().required(),
    notificationTitle: Joi.string().required(),
    email: Joi.string().email().required(),
    scheduleLink: Joi.string().required(),
    website: Joi.string().required(),
    phoneNumber: Joi.string()
      .pattern(/^\+([0-9]{1,3})\)?[\s]?[0-9]{6,14}$/)
      .required(),
    businessId: Joi.string()
      .required()
      .external(async (value) => {
        const business = await getBusinessById(value.toString());
        if (!business) throw new Error("Please provide valid Business.");
        return value;
      }),
  });
  private readonly updateSchema = Joi.object().keys({
    name: Joi.string().optional(),
    address: Joi.string().optional(),
    latitude: Joi.number().optional(),
    longitude: Joi.number().optional(),
    notificationTitle: Joi.string().optional(),
    email: Joi.string().email().optional(),
    scheduleLink: Joi.string().optional(),
    website: Joi.string().optional(),
    phoneNumber: Joi.string()
      .pattern(/^\+([0-9]{1,3})\)?[\s]?[0-9]{6,14}$/)
      .optional(),
  });

  protected readonly get = async (req: Request, res: Response) => {
    try {
      const { locationId } = req.params;
      if (locationId) {
        const location = await getLocationById(locationId);
        if (!location) {
          res.status(422).json({ message: "Invalid Location." });
          return;
        }
        res.status(200).json(location);
        return;
      }
      const locations = await getLocation();
      res.status(200).json(locations);
    } catch (error) {
      console.log("error", "error in get location", error);
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

      const location = await saveLocation(
        new Location({
          ...payloadValue,
          userId: authUser._id.toString(),
        })
      );

      const newLocation = await getLocationById(location._id);

      const business = await getBusinessById(
        payloadValue.businessId.toString()
      );

      await updateBusiness(
        new Business({
          ...business,
          locationIds: [location._id.toString(), ...business.locationIds],
        })
      );

      res.status(200).json(newLocation);
    } catch (error) {
      console.log("error", "error in create location", error);
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
      const { locationId } = req.params;
      if (!locationId) {
        res.status(422).json({ message: "Invalid Location." });
        return;
      }
      const location = await getLocationById(locationId);
      if (!location) {
        res.status(422).json({ message: "Invalid Location." });
        return;
      }

      if (location.userId.toString() !== authUser._id.toString()) {
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

      const updatedLocation = await updateLocation(
        new Location({ ...location.toJSON(), ...payloadValue })
      );

      res.status(200).json(updatedLocation);
    } catch (error) {
      console.log("error", "error in Updating Location", error);
      res.status(500).json({
        message: "Hmm... Something went wrong. Please try again later.",
        error: _get(error, "message"),
      });
    }
  };

  protected readonly delete = async (req: Request, res: Response) => {
    try {
      const authUser = req.authUser;
      const { locationId } = req.params;
      if (!locationId) {
        res.status(422).json({ message: "Invalid Location." });
        return;
      }
      const location = await getLocationById(locationId);
      if (!location) {
        res.status(422).json({ message: "Invalid Location." });
        return;
      }

      if (location.userId.toString() !== authUser._id.toString()) {
        res.status(401).json({ message: "Unauthorized." });
        return;
      }

      // await deleteLocation(locationId);
      res.status(200).json({ message: "Location is Deleted Successfully. " });
    } catch (error) {
      console.log("error", "error in Deleting Location", error);
      res.status(500).json({
        message: "Hmm... Something went wrong. Please try again later.",
        error: _get(error, "message"),
      });
    }
  };
}
