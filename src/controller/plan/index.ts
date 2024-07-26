import { Router } from "express";
import Controller from "./controller";

export default class Plan extends Controller {
  public router = Router();

  constructor() {
    super();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // this.router.get("/", this.get);
    this.router.get("/:planId", this.get);
    this.router.post(
      "/active/service",
      this.getActivePlanByServiceId
    );
    this.router.get(
      "/recommend/service/:serviceId",
      this.getRecommendByServiceId
    );
    this.router.patch("/like/plan", this.updateLikedPlan);
  }
}
