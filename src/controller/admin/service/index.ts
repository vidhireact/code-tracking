import { Router } from "express";
import Controller from "./controller";

export default class Service extends Controller {
  public router = Router();

  constructor() {
    super();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post("", this.create);
    this.router.patch("/:serviceId", this.update);
    this.router.get("/", this.get);
    this.router.get("/:serviceId", this.get);
    this.router.delete("/:serviceId", this.delete);
  }
}
