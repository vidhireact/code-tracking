import Controller from "./controller";
import { Router } from "express";

export default class User extends Controller {
  public router = Router();

  constructor() {
    super();
    this.initializeRoutes();
  }
  private initializeRoutes() {
    this.router.post("/invite-user", this.create);
    this.router.patch("/:userId", this.updateUser);
  }
}