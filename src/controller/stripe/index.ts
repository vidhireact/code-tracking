import express, { Router } from "express";
import { validateAuthIdToken } from "../../middleware/validateAuthIdToken";
import Controller from "./controller";

export default class Stripe extends Controller {
  public router = Router();
  public instance: express.Application;

  constructor() {
    super();
    this.instance = express();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post("/checkout", validateAuthIdToken, this.checkout);
  }
}
