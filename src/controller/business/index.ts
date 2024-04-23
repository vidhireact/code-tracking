import { Router } from "express";
import Controller from "./controller";

export default class Business extends Controller {
  public router = Router();

  constructor() {
    super();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post("", this.create);
    this.router.patch("/:locationId", this.update);
    this.router.get("/", this.get);
    this.router.get("/:locationId", this.get);
    this.router.delete("/:locationId", this.delete);
  }
}
