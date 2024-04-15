import cookieParser from "cookie-parser";
import express, { Application } from "express";
import cors from "cors";
import { middleware as contextMiddleware } from "express-http-context";
import User from "./controller/user";
import Auth from "./controller/auth";
import { validateAuthIdToken } from "./middleware/validateAuthIdToken";

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
    this.instance.use("/auth", new Auth().router);
    this.instance.use("/user", validateAuthIdToken, new User().router);
  }
}
