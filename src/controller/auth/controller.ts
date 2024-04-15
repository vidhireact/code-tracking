import { AES, enc } from "crypto-js";
import { Response } from "express";
import { Request } from "./../../request";
import validator from "validator";
import Joi from "joi";
import {
  IUser,
  User,
  saveUser,
  getUserByEmail,
  updateUser,
  getPopulatedUser,
  getUserByNumber,
} from "../../modules/user";
import { get as _get, compact as _compact } from "lodash";

export default class Controller {
  private readonly loginSchema = Joi.object({
    userName: Joi.string().custom((v) => {
      if (validator.isEmail(v)) {
        const data = {
          value: v,
          type: "EMAIL",
        };
        return data;
      }
      const phoneRegex = /^\+([0-9]{1,3})\)?[\s]?[0-9]{6,14}$/;
      if (phoneRegex.test(v)) {
        const data = {
          value: v,
          type: "PHONE",
        };
        return data;
      }
      throw new Error("Please Provide valid data");
    }),
    password: Joi.string().required(),
    pushToken: Joi.string().optional(),
    rememberMe: Joi.boolean().default(false).optional(),
  });

  private readonly registerSchema = Joi.object({
    fullName: Joi.string().required(),
    phoneNumber: Joi.string()
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

    email: Joi.string()
      .email()
      .required()
      .external(async (v: string) => {
        const user: IUser = await getUserByEmail(v);
        if (user) {
          throw new Error(
            "This email address is already associated with another account. Please use a different email address."
          );
        }
        return v;
      }),
    password: Joi.string()
      .required()
      .min(8)
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/)
      .external((v: string) => {
        return AES.encrypt(v, process.env.JWT_PASSWORD_SECRET).toString();
      }),
    pushToken: Joi.string().optional(),
    otp: Joi.string().required().length(6),
  });

  private readonly loginWithGoogleSchema = Joi.object({
    fullName: Joi.string().optional(),
    email: Joi.string().email().required(),
    googleId: Joi.string().required(),
    pushToken: Joi.string().optional(),
    rememberMe: Joi.boolean().default(false).optional(),
  }).unknown(true);

  private readonly duplicateSchema = Joi.object({
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
    email: Joi.string()
      .email()
      .optional()
      .external(async (v: string) => {
        const user: IUser = await getUserByEmail(v);
        if (user) {
          throw new Error(
            "This email address is already associated with another account. Please use a different email address."
          );
        }
        return v;
      }),
  });

  private readonly forgotPasswordSchema = Joi.object({
    phoneNumber: Joi.string()
      .pattern(/^\+([0-9]{1,3})\)?[\s]?[0-9]{6,14}$/)
      .required()
      .external(async (v: string) => {
        const user: IUser = await getUserByNumber(v);
        if (!user) {
          throw new Error(
            "This phone number is not registered with any account. Please use a different phone number."
          );
        }
        return v;
      }),
    otp: Joi.string().required().length(6),
    password: Joi.string()
      .required()
      .min(8)
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/)
      .custom((v) => {
        return AES.encrypt(v, process.env.JWT_PASSWORD_SECRET).toString();
      }),
  });

  protected readonly login = async (req: Request, res: Response) => {
    try {
      const payload = req.body;
      const pushToken = req.body.pushToken;

      // validate payload
      if (this.loginSchema.validate(payload).error) {
        res.status(422).json(this.loginSchema.validate(payload).error);
        return;
      }

      const payloadValue = this.loginSchema.validate(payload).value;
      // find user by email
      let user: User;
      if (payloadValue.userName.type === "EMAIL") {
        user = await getUserByEmail(payloadValue.userName.value);
        if (!user) {
          res.status(401).json({
            message: "Entered email has not been registered in priy account!",
          });
          return;
        }
      } else if (payloadValue.userName.type === "PHONE") {
        user = await getUserByNumber(payloadValue.userName.value);
        if (!user) {
          res.status(401).json({
            message:
              "Entered phone number has not been registered in priy account!",
          });
          return;
        }
      } else {
        res.status(410).json({
          message: "Hmm... Something went wrong. Please try again later.",
        });
        return;
      }
      if (!user.googleLogin && user.password !== "") {
        const userPassword = AES.decrypt(
          user.password,
          process.env.JWT_PASSWORD_SECRET
        ).toString(enc.Utf8);

        if (payloadValue.password !== userPassword) {
          res.status(401).json({ message: "Invalid password" });
          return;
        }

        if (user.FCMToken.indexOf(pushToken) === -1) {
          user.FCMToken.push(pushToken);
          await updateUser(
            new User({ ...user, FCMToken: _compact(user.FCMToken) })
          );
        }
        const populatedUser = await getPopulatedUser(user._id);
        const token = AES.encrypt(
          user._id.toString(),
          process.env.AES_KEY
        ).toString();

        if (payloadValue.rememberMe) {
          if (User.adminTypes.includes(populatedUser.userType)) {
            res.cookie("admin_auth", token, {
              expires: new Date("12/31/2100"),
              signed: true,
            });
          }
          res
            .cookie("auth", token, {
              expires: new Date("12/31/2100"),
              signed: true,
            })
            .status(200)
            .setHeader("x-auth-token", token)
            .json(populatedUser);
          return;
        } else {
          if (User.adminTypes.includes(populatedUser.userType)) {
            res.cookie("admin_auth", token, {
              signed: true,
            });
          }
          res
            .cookie("auth", token, {
              signed: true,
            })
            .status(200)
            .setHeader("x-auth-token", token)
            .json(populatedUser);
          return;
        }
      } else {
        res.status(402).json({
          message: "Please try to login with Google.",
        });
        return;
      }
    } catch (error) {
      console.log("error", "error in login", error);
      res.status(500).json({
        message: "Hmm... Something went wrong. Please try again later.",
        error: _get(error, "message"),
      });
    }
  };

  protected readonly duplicate = async (req: Request, res: Response) => {
    try {
      const payload = req.body;

      const payloadValue = await this.duplicateSchema
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
      res.status(200).json({ message: "Success" });
    } catch (error) {
      console.log("error", "error in login", error);
      res.status(500).json({
        message: "Hmm... Something went wrong. Please try again later.",
        error: _get(error, "message"),
      });
    }
  };

  protected readonly session = async (req: Request, res: Response) => {
    try {
      const isAdmin = req.isAdmin;

      if (!isAdmin) {
        res.status(403).json({ message: "Unauthorized request." }).end();
        return;
      }

      res.status(200).json(req.authUser);
    } catch (error) {
      console.log("error", "error at get session#################### ", error);

      res.status(500).json({
        message: "Hmm... Something went wrong. Please try again later.",
        error: _get(error, "message"),
      });
    }
  };

  protected readonly register = async (req: Request, res: Response) => {
    try {
      const payload = req.body;

      const payloadValue: {
        fullName: string;
        email: string;
        password: string;
        pushToken?: string;
        phoneNumber: string;
        otp: string;
      } = await this.registerSchema
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

      const user = await saveUser(
        new User({
          ...User.defaults,
          ...payloadValue,
          FCMToken: [payloadValue.pushToken ?? ""],
          isPhoneVerified: true,
          userType: "USER",
        } as IUser)
      );

      const populatedUser = await getPopulatedUser(user._id);

      const token = AES.encrypt(
        user._id.toString(),
        process.env.AES_KEY
      ).toString();

      res
        .cookie("auth", token, {
          expires: new Date("12/31/2100"),
          signed: true,
        })
        .status(200)
        .set({ "x-auth-token": token })
        .json(populatedUser);
    } catch (error) {
      console.log("error", "error in register", error);
      res.status(500).json({
        message: "Hmm... Something went wrong. Please try again later.",
        error: _get(error, "message"),
      });
    }
  };

  protected readonly logout = async (req: Request, res: Response) => {
    try {
      const pushToken = req.body.pushToken;

      const user = req.authUser;

      const index = user.FCMToken.indexOf(pushToken);

      user.FCMToken.splice(index, 1);
      await updateUser(new User({ ...user }));

      res.clearCookie("admin_auth", {
        signed: true,
      });
      res
        .clearCookie("auth", {
          signed: true,
        })
        .status(200)
        .json({ message: "Logout" });
    } catch (error) {
      console.log("error", "error in logout ", error);
      res.status(500).json({
        message: "Hmm... Something went wrong. Please try again later.",
        error: _get(error, "message"),
      });
    }
  };
}
