import { Router } from "express";
import Controller from "./controller";

export default class PreferredLocation extends Controller {
  public router = Router();

  constructor() {
    super();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post("/:preferredLocationId", this.update);
  }
}
