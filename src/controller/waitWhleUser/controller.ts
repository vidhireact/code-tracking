import { Response } from "express";
import { Request } from "./../../request";
import Joi from "joi";
import { get as _get, uniqBy as _uniqBy } from "lodash";
import axios from "axios";
import { AES } from "crypto-js";
import {
  WaitWhileUser,
  saveWaitWhileUser,
  getWaitWhileUserByEmail,
} from "../../modules/waitWhileUser";
import {
  Business,
  getBusinessById,
  updateBusiness,
} from "../../modules/business";

export default class Controller {
  private readonly waitWhileUserSchema = Joi.object().keys({
    businessId: Joi.string().required(),
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string()
      .required()
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/),
    roles: Joi.array().items(Joi.string()).required().max(4),
  });

  protected readonly create = async (req: Request, res: Response) => {
    try {
      const payload = req.body;
      const payloadValue = await this.waitWhileUserSchema
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

      const getBusiness = await getBusinessById(payloadValue.businessId);

      const option = {
        url: "https://api.waitwhile.com/v2/locations",
        method: "GET",
        headers: {
          accept: "application/json",
          "content-type": "application/json",
          apikey: `${waitWhileApiKey}`,
        },
      };

      const response = await axios(option);

      const findId = await response.data.results.find(
        (obj) => obj.name === getBusiness.name
      );

      const options = {
        url: "https://api.waitwhile.com/v2/users",
        method: "POST",
        headers: {
          accept: "application/json",
          "content-type": "application/json",
          apikey: `${waitWhileApiKey}`,
        },
        data: JSON.stringify({
          name: payloadValue.name,
          email: payloadValue.email,
          password: payloadValue.password,
          locationIds: [findId.id],
          roles: payloadValue.roles,
        }),
      };

      await axios(options);

      const password = AES.encrypt(
        payloadValue.password,
        process.env.AES_KEY
      ).toString();

      await saveWaitWhileUser(
        new WaitWhileUser({
          ...payloadValue,
          password: password,
        })
      ).catch((e) => {
        console.log(e);
        res.status(422).json({ message: e.message });
        return;
      });

      const newUser = await getWaitWhileUserByEmail(payloadValue.email);

      await updateBusiness(
        new Business({
          ...getBusiness,
          waitWhileUserId: _uniqBy(
            [...getBusiness.waitWhileUserId, newUser._id],
            (id) => id.toString()
          ),
        })
      );

      res.status(200).json(newUser);
    } catch (error) {
      console.log("error", "error in Update User", error);
      res.status(500).json({
        message: "Hmm... Something went wrong. Please try again later.",
        error: _get(error, "message"),
      });
    }
  };
}
