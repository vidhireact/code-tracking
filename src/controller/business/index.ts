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
    this.router.patch("/:businessId", this.update);
    this.router.get("/", this.get);
    this.router.get("/:businessId", this.get);
    this.router.delete("/:businessId", this.delete);
  }
}
