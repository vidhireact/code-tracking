import { Response } from "express";
import axios from "axios";
import Joi from "joi";
import { get as _get, find as _find } from "lodash";
import {
  getService,
  getServiceById,
  Service,
  saveService,
  updateService,
  // deleteService,
} from "../../../modules/service";
import { Request } from "../../../request";
import {
  getCategoryById,
  getPopulatedCategory,
} from "../../../modules/category";

export default class Controller {
  private readonly createSchema = Joi.object().keys({
    name: Joi.string()
      .required()
      .external(async (v: string, headers) => {
        if (!v) return v;
        const { categoryId } = headers.state.ancestors[0];
        const category = await getPopulatedCategory(categoryId);
        if (!category) {
          throw new Error("Please provide valid category.");
        }
        const name = _find(category.serviceIds, { name: v });
        if (name) {
          throw new Error("Please provide valid service name.");
        }
        return v;
      }),
    categoryId: Joi.string()
      .required()
      .external(async (v: string) => {
        if (!v) return v;
        const category = await getCategoryById(v);
        if (!category) {
          throw new Error("Please provide valid category.");
        }
        return v;
      }),
  });
  private readonly updateSchema = Joi.object().keys({
    name: Joi.string().optional(),
  });

  protected readonly get = async (req: Request, res: Response) => {
    try {
      const { serviceId } = req.params;
      if (serviceId) {
        const service = await getServiceById(serviceId);
        if (!service) {
          res.status(422).json({ message: "Invalid Service." });
          return;
        }
        res.status(200).json(service);
        return;
      }
      const services = await getService();
      res.status(200).json(services);
    } catch (error) {
      console.log("error", "error in get admin service", error);
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

      const waitWhileApiKey = process.env.WAIT_WHILE_KEY;

      const option = {
        url: `${process.env.WAITWHILE_BASE_URL}/services`,
        method: "POST",
        headers: {
          accept: "application/json",
          "content-type": "application/json",
          apikey: `${waitWhileApiKey}`,
        },
        data: JSON.stringify({
          name: payloadValue.name,
          locationIds: [process.env.WAIT_WHILE_BUSINESS_ID],
          isCategory: false,
          parentId: payloadValue.categoryId,
        }),
      };

      const response = await axios(option);

      const service = await saveService(
        new Service({
          ...payloadValue,
          waitWhileServiceId: response.data.id,
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
      const { serviceId } = req.params;
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
          res.status(422).json({ message: e.message });
          return;
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
      const { serviceId } = req.params;
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
