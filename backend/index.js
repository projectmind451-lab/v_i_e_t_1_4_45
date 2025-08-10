import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import bodyParser from "body-parser";
import { connectDB } from "./config/connectDB.js";
dotenv.config();
import userRoutes from "./routes/user.routes.js";
import sellerRoutes from "./routes/seller.routes.js";
import productRoutes from "./routes/product.routes.js";
import cartRoutes from "./routes/cart.routes.js";
import addressRoutes from "./routes/address.routes.js";
import orderRoutes from "./routes/order.routes.js";
import nodemailer from "nodemailer";
import { connectCloudinary } from "./config/cloudinary.js";

const app = express();

await connectCloudinary();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// allow multiple origins
const allowedOrigins = ["http://localhost:5173"];
//middlewares
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(cookieParser());
app.use(bodyParser.json());



const otpStore = {};

// OTP helpers
function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function setOtp(key, otp) {
  otpStore[key] = {
    otp,
    expires: Date.now() + 5 * 60 * 1000, // 5 minutes expiration
    attempts: 0,
  };
}

function validateOtp(key, otp) {
  const entry = otpStore[key];
  if (!entry) return { valid: false, message: "No OTP sent" };
  if (Date.now() > entry.expires) return { valid: false, message: "OTP expired" };
  if (entry.attempts >= 5) return { valid: false, message: "Too many attempts" };
  if (entry.otp !== otp) {
    entry.attempts += 1;
    return { valid: false, message: "Invalid OTP" };
  }
  delete otpStore[key];
  return { valid: true };
}

// Nodemailer SMTP transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});


// OTP email routes
app.post("/api/send-email-otp", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: "Email required" });

  const otp = generateOtp();
  setOtp(email, otp);

  try {
    await transporter.sendMail({
      from: `"OTP Service" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "Your OTP Code",
      text: `Your OTP code is: ${otp}`,
    });
    res.json({ message: "OTP sent to email" });
  } catch (err) {
    console.error("Error sending email:", err);
    res.status(500).json({ message: "Failed to send email" });
  }
});

app.post("/api/verify-email-otp", (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) return res.status(400).json({ message: "Email and OTP required" });

  const result = validateOtp(email, otp);
  if (!result.valid) return res.status(400).json({ message: result.message });

  res.json({ message: "Email OTP verified" });
});


// Api endpoints
app.use("/images", express.static("uploads"));
app.use("/api/user", userRoutes);
app.use("/api/seller", sellerRoutes);
app.use("/api/product", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/address", addressRoutes);
app.use("/api/order", orderRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  connectDB();
  console.log(`Server is running on port ${PORT}`);
});
