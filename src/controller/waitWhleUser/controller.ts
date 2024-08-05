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
    email: Joi.string()
      .email()
      .required()
      .external(async (v: string) => {
        if (!v) return v;
        const checkEmail = await getWaitWhileUserByEmail(v);
        if (!checkEmail) {
          throw new Error("Please provide valid waitWhile User Email");
        }
        return v;
      }),
    password: Joi.string()
      .required()
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/),
    roles: Joi.array()
      .items(Joi.string().valid("admin", "editor", "reader", "owner"))
      .required()
      .max(4),
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

      const getBusiness = await getBusinessById(payloadValue.businessId)

      if(!getBusiness){
        res.status(422).json({ message: "Invalid Business." });
        return;
      }

      const options = {
        url: `${process.env.WAITWHILE_BASE_URL}/users`,
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
          locationIds: [getBusiness.waitWhileLocationId],
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
