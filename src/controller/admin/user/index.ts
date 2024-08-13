import { Router } from "express";
import Controller from "./controller";

export default class Users extends Controller {
  public router = Router();
  constructor() {
    super();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get("/", this.get);
  }
}
