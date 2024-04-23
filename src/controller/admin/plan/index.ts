import { Router } from "express";
import Controller from "./controller";

export default class Plan extends Controller {
  public router = Router();

  constructor() {
    super();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post("", this.create);
    this.router.patch("/:planId", this.update);
    this.router.get("/", this.get);
    this.router.get("/:planId", this.get);
    this.router.delete("/:planId", this.delete);
  }
}
