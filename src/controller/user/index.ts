import Controller from "./controller";
import { Router } from "express";

export default class User extends Controller {
  public router = Router();

  constructor() {
    super();
    this.initializeRoutes();
  }
  private initializeRoutes() {
    this.router.post("", this.create);
    this.router.post("/password_verification", this.passwordVerification);
    this.router.patch("/:userId", this.updateUser);
    this.router.get("/:businessId", this.getUserByBusinessId)
  }
}
