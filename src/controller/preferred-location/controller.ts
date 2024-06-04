import { Response } from "express";

import Joi from "joi";
import { get as _get } from "lodash";

import { Request } from "../../request";
import { getServiceById } from "../../modules/service";
import {
  PreferredLocation,
  getPopulatedPreferredLocationById,
  getPreferredLocationById,
  updatePreferredLocation,
} from "../../modules/preferred-location";

export default class Controller {
  private readonly updateSchema = Joi.object().keys({
    range: Joi.number().optional(),
    rangeType: Joi.string().optional().valid("KM", " MILE"),
    address: Joi.string().optional(),
    latitude: Joi.number().optional(),
    longitude: Joi.number().optional(),
    serviceId: Joi.string()
      .optional()
      .external(async (v: string) => {
        if (!v) return v;
        const service = await getServiceById(v);
        if (!service) {
          throw new Error("Please provide valid service for profile service.");
        }
        return v;
      }),
  });

  protected readonly update = async (req: Request, res: Response) => {
    try {
      const payload = req.body;
      const authUser = req.authUser;
      const { preferredLocationId } = req.params;
      if (!preferredLocationId) {
        res.status(422).json({ message: "Invalid preferredLocation." });
        return;
      }
      const preferredLocation = await getPreferredLocationById(
        preferredLocationId
      );
      if (!preferredLocation) {
        res.status(422).json({ message: "Invalid preferredLocation." });
        return;
      }

      if (preferredLocation.userId.toString() !== authUser._id.toString()) {
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

      await updatePreferredLocation(
        new PreferredLocation({
          ...preferredLocation.toJSON(),
          ...payloadValue,
        })
      );

      const populatedPreferredLocationById =
        await getPopulatedPreferredLocationById(preferredLocationId);

      res.status(200).json(populatedPreferredLocationById);
    } catch (error) {
      console.log("error", "error in Updating PreferredLocation", error);
      res.status(500).json({
        message: "Hmm... Something went wrong. Please try again later.",
        error: _get(error, "message"),
      });
    }
  };
}
