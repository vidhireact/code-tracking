import { Response } from "express";

import Joi, { isError } from "joi";
import { get as _get } from "lodash";
import {
  getLocation,
  getLocationById,
  Location,
  saveLocation,
  updateLocation,
  // deleteLocation,
} from "../../../modules/location";
import { Request } from "../../../request";

export default class Controller {
  private readonly createSchema = Joi.object().keys({
    name: Joi.string().required(),
    address: Joi.string().required(),
    latitude: Joi.string().required(),
    longitude: Joi.string().required(),
  });
  private readonly updateSchema = Joi.object().keys({
    name: Joi.string().optional(),
    address: Joi.string().optional(),
    latitude: Joi.string().optional(),
    longitude: Joi.string().optional(),
  });

  protected readonly get = async (req: Request, res: Response) => {
    const LocationId = req.params._id;
    if (LocationId) {
      const location = await getLocationById(LocationId);
      if (!location) {
        res.status(422).json({ message: "Invalid Location." });
        return;
      }
      res.status(200).json(location);
      return;
    }
    const locations = await getLocation();
    res.status(200).json(locations);
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
          if (isError(e)) {
            res.status(422).json(e);
            return;
          } else {
            res.status(422).json({ message: e.message });
            return;
          }
        });
      if (!payloadValue) {
        return;
      }

      const location = await saveLocation(
        new Location({
          ...payloadValue,
        })
      );

      const newLocation = await getLocationById(location._id);
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
      const locationId = req.params._id;
      if (!locationId) {
        res.status(422).json({ message: "Invalid Location." });
        return;
      }
      const location = await getLocationById(locationId);
      if (!location) {
        res.status(422).json({ message: "Invalid Location." });
        return;
      }

      const payloadValue = await this.updateSchema
        .validateAsync(payload)
        .then((value) => {
          return value;
        })
        .catch((e) => {
          console.log(e);
          if (isError(e)) {
            res.status(422).json(e);
            return;
          } else {
            res.status(422).json({ message: e.message });
            return;
          }
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
      const locationId = req.params._id;
      if (!locationId) {
        res.status(422).json({ message: "Invalid Location." });
        return;
      }
      const location = await getLocationById(locationId);
      if (!location) {
        res.status(422).json({ message: "Invalid Location." });
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
