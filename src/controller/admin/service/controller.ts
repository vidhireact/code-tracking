import { Response } from "express";

import Joi, { isError } from "joi";
import { get as _get } from "lodash";
import {
  getService,
  getServiceById,
  Service,
  saveService,
  updateService,
  // deleteService,
} from "../../../modules/service";
import { Request } from "../../../request";

export default class Controller {
  private readonly createSchema = Joi.object().keys({
    title: Joi.string().required(),
    embeddedLink: Joi.string().required().allow(null, ""),
    description: Joi.string().required().allow(null, ""),
  });
  private readonly updateSchema = Joi.object().keys({
    title: Joi.string().optional(),
    embeddedLink: Joi.string().optional().allow(null, ""),
    description: Joi.string().optional().allow(null, ""),
  });

  protected readonly get = async (req: Request, res: Response) => {
    const ServiceId = req.params._id;
    if (ServiceId) {
      const service = await getServiceById(ServiceId);
      if (!service) {
        res.status(422).json({ message: "Invalid Service." });
        return;
      }
      res.status(200).json(service);
      return;
    }
    const services = await getService();
    res.status(200).json(services);
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

      const service = await saveService(
        new Service({
          ...payloadValue,
        })
      );

      const newService = await getServiceById(service._id);
      res.status(200).json(newService);
    } catch (error) {
      console.log("error", "error in create service", error);
      res.status(500).json({
        message: "Hmm... Something went wrong. Please try again later.",
        error: _get(error, "message"),
      });
    }
  };

  protected readonly update = async (req: Request, res: Response) => {
    try {
      const payload = req.body;
      const serviceId = req.params._id;
      if (!serviceId) {
        res.status(422).json({ message: "Invalid Service." });
        return;
      }
      const service = await getServiceById(serviceId);
      if (!service) {
        res.status(422).json({ message: "Invalid Service." });
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

      const updatedService = await updateService(
        new Service({ ...service.toJSON(), ...payloadValue })
      );

      res.status(200).json(updatedService);
    } catch (error) {
      console.log("error", "error in Updating Service", error);
      res.status(500).json({
        message: "Hmm... Something went wrong. Please try again later.",
        error: _get(error, "message"),
      });
    }
  };

  protected readonly delete = async (req: Request, res: Response) => {
    try {
      const serviceId = req.params._id;
      if (!serviceId) {
        res.status(422).json({ message: "Invalid Service." });
        return;
      }
      const service = await getServiceById(serviceId);
      if (!service) {
        res.status(422).json({ message: "Invalid Service." });
        return;
      }
      // await deleteService(serviceId);
      res.status(200).json({ message: "Service is Deleted Successfully. " });
    } catch (error) {
      console.log("error", "error in Deleting Service", error);
      res.status(500).json({
        message: "Hmm... Something went wrong. Please try again later.",
        error: _get(error, "message"),
      });
    }
  };
}
