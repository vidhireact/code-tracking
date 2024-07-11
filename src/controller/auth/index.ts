import { Router } from "express";
import { validateAuthIdToken } from "../../middleware/validateAuthIdToken";
import Controller from "./controller";

export default class Auth extends Controller {
  public router = Router();
  constructor() {
    super();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post("/login", this.login);
    this.router.post("/duplicate", this.duplicate);
    this.router.post(
      "/session",
      validateAuthIdToken,
      // validateIsAdmin,
      this.session
    );
    this.router.post("/register", this.register);
    this.router.post("/logout", validateAuthIdToken, this.logout);
    this.router.post("/loginWithGoogle", this.loginWithGoogle)
  }
}
