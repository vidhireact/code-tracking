import { Response } from "express";
import { Request } from "./../../request";
import Joi from "joi";
import { get as _get } from "lodash";
import { AES, enc } from "crypto-js";

import {
  getPopulatedUser,
  getUserById,
  getUserByNumber,
  IUser,
  updateUser,
  User,
} from "../../modules/user";

import { getWaitWhileUserByBusinessId } from "../../modules/waitWhileUser";

export default class Controller {
  protected readonly updateUserSchema = Joi.object({
    firstName: Joi.string().optional(),
    lastName: Joi.string().optional(),
    email: Joi.string().email(),
    phoneNumber: Joi.string()
      .pattern(/^\+([0-9]{1,3})\)?[\s]?[0-9]{6,14}$/)
      .optional()
      .external(async (v: string) => {
        const user: IUser = await getUserByNumber(v);
        if (user) {
          throw new Error(
            "This phone number is already associated with another account. Please use a different phone number."
          );
        }
        return v;
      }),
    address: Joi.string().optional(),
    profilePic: Joi.string().optional(),
    latitude: Joi.number().optional(),
    longitude: Joi.number().optional(),
  });

  protected readonly updatePhoneSchema = Joi.object({
    newPhoneNumber: Joi.string()
      .pattern(/^\+([0-9]{1,3})\)?[\s]?[0-9]{6,14}$/)
      .required()
      .external(async (v: string) => {
        const user: IUser = await getUserByNumber(v);
        if (user) {
          throw new Error(
            "This phone number is already associated with another account. Please use a different phone number."
          );
        }
        return v;
      }),
    otp: Joi.string().required(),
  });

  protected readonly updatePasswordSchema = Joi.object({
    currentPassword: Joi.string()
      .required()
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/),
    newPassword: Joi.string()
      .required()
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/)
      .custom((v) => {
        return AES.encrypt(v, process.env.JWT_PASSWORD_SECRET).toString();
      }),
  });

  protected readonly updateUser = async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      if (!userId) {
        res.status(422).json({ message: "User Not Found." });
        return;
      }
      const user: User = await getUserById(userId);

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

      const updatableUser = new User({
        ...user.toJSON(),
        ...payloadValue,
      });

      if (payloadValue.email) {
        updatableUser.isEmailVerified = false;
      }
      if (payloadValue.phoneNumber) {
        updatableUser.isPhoneVerified = false;
      }

      await updateUser(updatableUser);

      const populatedUser = await getPopulatedUser(user._id);

      res.status(200).json(populatedUser);
    } catch (error) {
      console.log("error", "error in Update User", error);
      res.status(500).json({
        message: "Hmm... Something went wrong. Please try again later.",
        error: _get(error, "message"),
      });
    }
  };

  protected readonly passwordVerification = async (
    req: Request,
    res: Response
  ) => {
    try {
      res.status(200).json({ message: "Password Verified" });
    } catch (error) {
      console.log(
        "error",
        "error at passwordVerification  #################### ",
        error
      );

      res.status(500).json({
        message: "Hmm... Something went wrong. Please try again later.",
        error: _get(error, "message"),
      });
    }
  };

  protected readonly getUserByBusinessId = async (req: Request, res: Response) => {
    try {
      const { businessId } = req.params;
      if(!businessId){
        res.status(422).json({ message: "Invalid Business ID." });
        return;
      }

      const user = await getWaitWhileUserByBusinessId(businessId);
      res.status(200).json(user);

    } catch (error) {
      console.log("error", "error in get getUserByBusinessId", error);
      res.status(500).json({
        message: "Hmm... Something went wrong. Please try again later.",
        error: _get(error, "message"),
      });
    }
  };
}
