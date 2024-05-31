import { Router } from "express";
import Controller from "./controller";

export default class GrowthCollaborative extends Controller {
  public router = Router();

  constructor() {
    super();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post("", this.create);
    this.router.patch("/:growthCollaborativeId", this.update);
    this.router.get("/", this.get);
    this.router.get("/:growthCollaborativeId", this.get);
    this.router.delete("/:growthCollaborativeId", this.delete);
  }
}
