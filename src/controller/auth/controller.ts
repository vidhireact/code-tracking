import { AES, enc } from "crypto-js";
import { Response } from "express";
import { Request } from "./../../request";
import Joi from "joi";
import admin from "../../config/firebase"
import {
  IUser,
  User,
  saveUser,
  getUserByEmail,
  getPopulatedUser,
  getUserByNumber,
  updateUser,
} from "../../modules/user";
import { get as _get } from "lodash";
import {
  PreferredLocation,
  savePreferredLocation,
} from "../../modules/preferred-location";

export default class Controller {
  private readonly loginSchema = Joi.object({
    email: Joi.string()
      .email()
      .optional()
      .external(async (v: string) => {
        const user: IUser = await getUserByEmail(v);
        if (!user) {
          throw new Error(
            "This email address is not associated with account. Please use a different email address."
          );
        }
        return v;
      }),
    password: Joi.string().required(),
    rememberMe: Joi.boolean().default(false).optional(),
  });

  private readonly registerSchema = Joi.object({
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
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
    address: Joi.string().required(),
    latitude: Joi.number().required(),
    longitude: Joi.number().required(),
  });

  private readonly duplicateSchema = Joi.object({
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

  private readonly signupWithGoogle = Joi.object({
    name: Joi.string().required(),
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
      })
  })

  protected readonly login = async (req: Request, res: Response) => {
    try {
      const payload = req.body;

      const payloadValue = await this.loginSchema
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

      let user = await getUserByEmail(payloadValue.email);
      if (!user) {
        res.status(401).json({
          message:
            "Entered email has not been registered in executavia account!",
        });
        return;
      }

      if (!user) {
        res.status(401).json({
          message:
            "Entered phone number has not been registered in executavia account!",
        });
        return;
      }

      const userPassword = AES.decrypt(
        user.password,
        process.env.JWT_PASSWORD_SECRET
      ).toString(enc.Utf8);

      if (payloadValue.password !== userPassword) {
        res.status(401).json({ message: "Invalid password" });
        return;
      }

      const populatedUser = await getPopulatedUser(user._id);
      const token = AES.encrypt(
        user._id.toString(),
        process.env.AES_KEY
      ).toString();

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
      const populatedUser = await getPopulatedUser(req.authUser._id);
      res.status(200).json(populatedUser);
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

      const payloadValue = await this.registerSchema
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
          ...payloadValue,
        })
      );

      const preferredLocation = await savePreferredLocation(
        new PreferredLocation({
          range: 20,
          rangeType: "KM",
          address: user.address,
          latitude: user.latitude,
          longitude: user.longitude,
          userId: user._id.toString(),
          serviceId: null,
        })
      );

      await updateUser(
        new User({
          ...user,
          preferredLocationId: preferredLocation._id.toString(),
        })
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
      // const pushToken = req.body.pushToken;

      // const user = req.authUser;

      // const index = user.FCMToken.indexOf(pushToken);

      // user.FCMToken.splice(index, 1);
      // await updateUser(new User({ ...user }));

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

  protected readonly loginWithGoogle = async (req: Request, res: Response) => {
    try {
      const idToken = req.body.idToken;

      const decodedToken = await admin.auth().verifyIdToken(idToken);

      const { email, name, firebase } = decodedToken;
     
      const dataVerify = await admin.auth().getUserByEmail(email).catch(error => {
        if (error.code === 'auth/user-not-found') {
          return null; 
        } else {
          throw error; 
        }
      });

      if (!dataVerify) {
        return res.status(400).json({ message: 'Email not found in Firebase Authentication' });
      }

      const userEmail = await getUserByEmail(email);

      if (userEmail) {

        const isGoogleLogin = firebase.sign_in_provider === 'google.com';
        const isFacebookLogin = firebase.sign_in_provider === 'facebook.com';
        const isAppleLogin = firebase.sign_in_provider === 'apple.com';

        if (isGoogleLogin && !userEmail.isGoogleLogin) {
          return res.status(403).json({ message: 'User did not sign up with Google' });
        
        }else if (isFacebookLogin && !userEmail.isFacebookLogin) {
          return res.status(403).json({ message: 'User did not sign up with Facebook' });
        
        }else if (isAppleLogin && !userEmail.isAppleLogin) {
          return res.status(403).json({ message: 'User did not sign up with Apple' });
        }

        const token = AES.encrypt(userEmail._id.toString(), process.env.AES_KEY).toString();

        if (User.adminTypes.includes(userEmail.userType)) {
          res.cookie("admin_auth", token, { signed: true });
        }

        res.cookie("auth", token, { signed: true })
          .status(200)
          .setHeader("x-auth-token", token)
          .json(userEmail);

      } else {

        const payload = { email, name };

        try {
          await this.signupWithGoogle.validateAsync(payload);
        } catch (error) {
          return res.status(422).json({ message: error.message });
        }

        const newUser = {
          firstName: name.split(' ')[0],
          lastName: name.split(' ').slice(1).join(' '),
          email: email,
          isSocialLogin: true,
          isGoogleLogin: firebase.sign_in_provider === 'google.com',
          isFacebookLogin: firebase.sign_in_provider === 'facebook.com',
          isAppleLogin: firebase.sign_in_provider === 'apple.com'

        };

        const user = await saveUser(
          new User({
            ...newUser
          })
        );

        if (!user) {
          return res.status(401).json({
            message: "Entered email has not been registered in executavia account!",
          });
        }

        const populatedUser = await getPopulatedUser(user._id);

        const token = AES.encrypt(
          user._id.toString(),
          process.env.AES_KEY
        ).toString();

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
      }

    } catch (error) {
      console.log("error", "error in signup", error);
      res.status(500).json({
        message: "Hmm... Something went wrong. Please try again later.",
        error: _get(error, "message"),
      });
    }
  }
}
