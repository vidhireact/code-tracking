import cookieParser from "cookie-parser";
import express, { Application } from "express";
import cors from "cors";
import { middleware as contextMiddleware } from "express-http-context";
import User from "./controller/user";
import Auth from "./controller/auth";
import { validateAuthIdToken } from "./middleware/validateAuthIdToken";
import Admin from "./controller/admin";
import { validateIsAdmin } from "./middleware/validateIsAdmin";
import Location from "./controller/location";
import Business from "./controller/business";
import Service from "./controller/service";
import Plan from "./controller/plan";
import GrowthCollaborative from "./controller/growthCollaborative";
import Subscription from "./controller/subscription";
import PreferredLocation from "./controller/preferred-location";
import Stripe from "./controller/stripe";
import WaitWhile from "./controller/waitWhleUser";

export default class App {
  public static instance: Application;
  private static port: number;

  public static start(port: number) {
    this.instance = express();
    this.port = port;

    // Add middleware.
    this.initializeMiddleware();

    // Add controllers
    this.initializeControllers();
  }

  private static initializeMiddleware() {
    // CORS
    this.instance.use(
      cors({
        origin: true,
        credentials: true,
        exposedHeaders: "x-auth-token",
      })
    );

    // Cookie parser.
    this.instance.use(cookieParser(process.env.COOKIE_SECRET));

    // enable http context
    this.instance.use(contextMiddleware);

    // Body Parser
    this.instance.use(express.json({ limit: "50mb" })); // support json encoded bodies
    this.instance.use(express.static(process.cwd() + "/public"));
  }

  private static initializeControllers() {
    // Mount controllers
    this.instance.use(
      "/admin",
      validateAuthIdToken,
      validateIsAdmin,
      new Admin().instance
    );
    this.instance.use("/auth", new Auth().router);
    this.instance.use("/user", validateAuthIdToken, new User().router);
    this.instance.use("/location", validateAuthIdToken, new Location().router);
    this.instance.use("/business", validateAuthIdToken, new Business().router);
    this.instance.use("/service", validateAuthIdToken, new Service().router);
    this.instance.use("/plan", validateAuthIdToken, new Plan().router);
   
    this.instance.use(
      "/growth-collaborative",
      validateAuthIdToken,
      new GrowthCollaborative().router
    );
    this.instance.use(
      "/subscription",
      validateAuthIdToken,
      new Subscription().router
    );
    this.instance.use(
      "/preferred-location",
      validateAuthIdToken,
      new PreferredLocation().router
    );
    this.instance.use("/payment", validateAuthIdToken, new Stripe().router);
    this.instance.use(
      "/waitWhile-user",
      validateAuthIdToken,
      new WaitWhile().router
    );
  }
}
