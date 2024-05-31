import { Response } from "express";
import { get as _get } from "lodash";
import { getService, getServiceById } from "../../modules/service";
import { Request } from "../../request";

export default class Controller {
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
      console.log("error", "error in get service", error);
      res.status(500).json({
        message: "Hmm... Something went wrong. Please try again later.",
        error: _get(error, "message"),
      });
    }
  };
}
