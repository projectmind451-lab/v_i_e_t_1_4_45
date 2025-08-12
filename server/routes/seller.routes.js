import express from "express";
import {
  checkAuth,
  sellerLogin,
  sellerLogout,
} from "../controller/seller.controller.js";
const router = express.Router();

router.post("/login", sellerLogin);
// Public auth check and logout in guest mode
router.get("/is-auth", checkAuth);
router.get("/logout", sellerLogout);

export default router;
