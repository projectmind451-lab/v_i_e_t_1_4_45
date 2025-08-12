import express from "express";
import authUser from "../middlewares/authUser.js";
import { addAddress, getAddress } from "../controller/address.controller.js";

const router = express.Router();
router.post("/", (req, res) => {
    const addressData = req.body;
    console.log("Received address:", addressData);
  
    // Save to DB here if needed...
    res.status(201).json({ message: "Address saved successfully" });
  });
router.post("/add", addAddress);
router.get("/get", getAddress);
export default router;
