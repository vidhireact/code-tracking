import { Router } from "express";
import Controller from "./controller";

export default class GrowthCollaborative extends Controller {
  public router = Router();

  constructor() {
    super();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // this.router.get("/", this.get);
    this.router.get("/:growthCollaborativeId", this.get);
    this.router.post("/service", this.getGrowthCollaborativeByServiceId);
    this.router.post("/:businessId", this.getGrowthCollaborativeByBusinessId);
  }
}

