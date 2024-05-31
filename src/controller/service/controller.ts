import { Response } from "express";
import { get as _get } from "lodash";
import { getService, getServiceById } from "../../modules/service";
import { Request } from "../../request";

export default class Controller {
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
}
