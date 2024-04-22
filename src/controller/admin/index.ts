import express, { Router } from "express";
import Service from "./service";

export default class Admin {
  public instance: express.Application;
  public router = Router();

  constructor() {
    this.instance = express();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.instance.use("/service", new Service().router);
  }
}
