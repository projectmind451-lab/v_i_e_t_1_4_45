import express from "express";
import {
  checkAuth,
  loginUser,
  logout,
  registerUser,
} from "../controller/user.controller.js";
const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
// Public auth check and logout to avoid 401s in guest mode
router.get("/is-auth", checkAuth);
router.get("/logout", logout);

export default router;
