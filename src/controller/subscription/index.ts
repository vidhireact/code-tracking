import { Router } from "express";
import Controller from "./controller";

export default class Subscription extends Controller {
  public router = Router();

  constructor() {
    super();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post("", this.create);
    this.router.patch("/associate/:subscriptionId", this.update);
    this.router.get("/", this.get);
    this.router.get("/:subscriptionId", this.get);
    this.router.delete("/:subscriptionId", this.delete);
    this.router.get("/business/:subscriptionId", this.getBusinessBySubscriptionId);
    this.router.get("/business-id/:businessId", this.getBusinessById);
  }
}
