import express, { Router } from "express";
import Service from "./service";
import GrowthCollaborative from "./growthCollaborative";
import Plan from "./plan";
import User from "./user";
import Category from "./category";
import Business from "./business";

export default class Admin {
  public instance: express.Application;
  public router = Router();

  constructor() {
    this.instance = express();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.instance.use("/service", new Service().router);
    this.instance.use("/plan", new Plan().router);
    this.instance.use(
      "/growth-collaborative",
      new GrowthCollaborative().router
    );
    this.instance.use("/user", new User().router);
    this.instance.use(
      "/business",
      new Business().router
    );
    this.instance.use("/category", new Category().router);
  }
}
