import { Router } from "express";
import Controller from "./controller";

export default class Category extends Controller {
  public router = Router();

  constructor() {
    super();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get("/get-category", this.getCategoryForService);
    this.router.get("/", this.get);
    this.router.get("/:categoryId", this.get); 
  }
}
