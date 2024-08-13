import { Response } from "express";
import { Request } from "./../../request";
import Joi from "joi";
import { get as _get, uniqBy as _uniqBy } from "lodash";
import axios from "axios";
import { AES, enc } from "crypto-js";
import {
  WaitWhileUser,
  getWaitWhileUserById,
  saveWaitWhileUser,
  getWaitWhileUserByEmail,
  updateWaitWhileUser,
} from "../../modules/wait-while-user";
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
        if (checkEmail) {
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

  private readonly updateUserSchema = Joi.object().keys({
    name: Joi.string().optional(),
    email: Joi.string()
      .email()
      .optional()
      .external(async (v: string) => {
        if (!v) return v;
        const checkEmail = await getWaitWhileUserByEmail(v);
        if (checkEmail) {
          throw new Error("Please provide valid waitWhile User Email");
        }
        return v;
      }),
    password: Joi.string()
      .optional()
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/),
    roles: Joi.array()
      .items(Joi.string().valid("admin", "editor", "reader", "owner"))
      .optional()
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

      const getBusiness = await getBusinessById(payloadValue.businessId);

      if (!getBusiness) {
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

      const waitWhileUser = await axios(options);

      const password = AES.encrypt(
        payloadValue.password,
        process.env.AES_KEY
      ).toString();

      await saveWaitWhileUser(
        new WaitWhileUser({
          ...payloadValue,
          password: password,
          waitWhileUserId: waitWhileUser.data.id,
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
      console.log("error", "error in create User", error);
      res.status(500).json({
        message: "Hmm... Something went wrong. Please try again later.",
        error: _get(error, "message"),
      });
    }
  };

  protected readonly updateUser = async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      if (!userId) {
        res.status(422).json({ message: "User Not Found." });
        return;
      }
      const user = await getWaitWhileUserById(userId);

      if (!user) {
        res.status(422).json({ message: "User Not Found." });
        return;
      }

      const payload = req.body;

      const payloadValue = await this.updateUserSchema
        .validateAsync(payload)
        .then((value) => {
          return value;
        })
        .catch((e) => {
          console.log(e);
          res.status(422).json({ message: e.message });
        });
      if (!payloadValue) {
        return;
      }

      const waitWhileApiKey = process.env.WAIT_WHILE_KEY;

      const getBusiness = await getBusinessById(user.businessId.toString());

      if (!getBusiness) {
        res.status(422).json({ message: "Invalid Business." });
        return;
      }

      const options = {
        url: `${process.env.WAITWHILE_BASE_URL}/users/${user.waitWhileUserId}`,
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

      const oldPassword = AES.decrypt(
        user.password,
        process.env.AES_KEY
      ).toString(enc.Utf8);

      if (oldPassword === payloadValue.password) {
        res.status(422).json({ message: "Invalid Password." });
        return;
      }

      const password = AES.encrypt(
        payloadValue.password,
        process.env.AES_KEY
      ).toString();

      const updateWaitWahileUser = await updateWaitWhileUser(
        new WaitWhileUser({
          ...user,
          ...payloadValue,
          password: password
        })
      )

      res.status(200).json(updateWaitWahileUser);
    } catch (error) {
      console.log("error", "error in Update User", error);
      res.status(500).json({
        message: "Hmm... Something went wrong. Please try again later.",
        error: _get(error, "message"),
      });
    }
  };
}
