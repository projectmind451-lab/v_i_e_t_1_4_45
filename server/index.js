import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import bodyParser from "body-parser";
import { connectDB } from "./config/connectDB.js";
import fs from "fs";
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

// Parse JSON bodies first
app.use(bodyParser.json());
app.use(cookieParser());

// CORS configuration must come before any routes
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'https://vinitamart-frontend.onrender.com'  // Add explicit frontend URL
].filter(Boolean);  // Remove any undefined values

console.log('Allowed origins:', allowedOrigins);

// Configure CORS with enhanced security
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      console.log('Blocked origin:', origin);
      return callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization', 'Cookie'],
  maxAge: 86400 // 24 hours
}));

// Initialize Cloudinary
await connectCloudinary();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);



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

// Verify SMTP connection on startup (dev aid)
transporter
  .verify()
  .then(() => console.log("SMTP transporter verified and ready"))
  .catch((err) => console.error("SMTP transporter verification failed:", err.message));


// OTP email routes
app.post("/api/send-email-otp", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: "Email required" });

  const otp = generateOtp();
  setOtp(email, otp);

  try {
    // Basic env validation to avoid silent 500s
    const requiredEnv = ["SMTP_HOST", "SMTP_PORT", "SMTP_USER", "SMTP_PASS"];
    const missing = requiredEnv.filter((k) => !process.env[k]);
    if (missing.length) {
      console.error("Missing SMTP env vars:", missing.join(", "));
      return res.status(500).json({ message: "Email service not configured" });
    }
    const brandName = process.env.BRAND_NAME || "Vinitamart";
    const logoUrl = process.env.LOGO_URL || "";
    const subject = `${brandName} OTP: ${otp}`;
    const text = `Use the following One-Time Password (OTP) to continue: ${otp}\n\nThis code will expire in 5 minutes. If you did not request this, please ignore this email.`;
    // Build logo header (supports http(s) URL or local path via CID)
    let headerLogoHtml = "";
    let attachments = [];
    if (logoUrl) {
      const isHttp = /^https?:\/\//i.test(logoUrl);
      if (isHttp) {
        headerLogoHtml = `<img src="${logoUrl}" alt="${brandName}" style="height:28px; width:auto; display:block; border-radius:4px; background:#ffffff; padding:2px;"/>`;
      } else {
        // try to resolve relative/local paths
        const candidates = [
          logoUrl,
          path.resolve(process.cwd(), logoUrl),
          path.resolve(__dirname, logoUrl),
          path.resolve(__dirname, "src", logoUrl.replace(/^\.\//, "")),
          path.resolve(__dirname, "..", "client", logoUrl.replace(/^\.\//, "")),
          path.resolve(__dirname, "..", logoUrl),
        ];
        const existingPath = candidates.find((p) => {
          try { return fs.existsSync(p); } catch { return false; }
        });
        if (existingPath) {
          const cid = "brandLogoOtp";
          headerLogoHtml = `<img src=\"cid:${cid}\" alt=\"${brandName}\" style=\"height:28px; width:auto; display:block; border-radius:4px; background:#ffffff; padding:2px;\"/>`;
          attachments.push({ filename: existingPath.split(/[\\/]/).pop() || "logo.png", path: existingPath, cid });
        }
      }
    }

    const html = `
      <div style="font-family: Arial, Helvetica, sans-serif; background:#f6f7f9; padding:24px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;">
          <tr>
            <td style="padding:20px 24px; background:#0ea5e9; color:#ffffff;">
              <div style="display:flex; align-items:center; gap:12px;">
                ${headerLogoHtml}
                <h1 style="margin:0;font-size:18px;">${brandName} Verification</h1>
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding:24px; color:#111827;">
              <p style="margin:0 0 8px 0; font-size:16px;">Your One-Time Password (OTP) is</p>
              <div style="margin:12px 0 16px 0;">
                <div style="display:inline-block; font-size:28px; letter-spacing:6px; font-weight:700; color:#111827; background:#f3f4f6; border:1px dashed #d1d5db; padding:12px 16px; border-radius:10px;">
                  ${otp}
                </div>
              </div>
              <p style="margin:0 0 6px 0; color:#374151;">This code will expire in <strong>5 minutes</strong>.</p>
              <p style="margin:0; color:#6b7280; font-size:14px;">If you did not request this, you can safely ignore this email.</p>
            </td>
          </tr>
          <tr>
            <td style="padding:16px 24px; background:#f9fafb; color:#6b7280; font-size:12px; text-align:center;">
              <p style="margin:0;">${brandName} • This is an automated message, please do not reply.</p>
            </td>
          </tr>
        </table>
      </div>`;

    await transporter.sendMail({
      from: `Vinitamart <${process.env.SMTP_USER}>`,
      to: email,
      subject,
      text,
      html,
      attachments,
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


// Serve static files from the uploads/images directory
const imagesPath = path.join(process.cwd(), 'uploads', 'images');

// Create images directory if it doesn't exist
if (!fs.existsSync(imagesPath)) {
  fs.mkdirSync(imagesPath, { recursive: true });
}

// Serve static files with proper CORS and caching
app.use("/uploads/images", 
  cors({ 
    origin: [process.env.FRONTEND_URL, 'http://localhost:5173'],
    credentials: true
  }), 
  express.static(imagesPath, {
    setHeaders: (res, path) => {
      // Set proper cache control headers for images
      if (path.endsWith('.png') || path.endsWith('.jpg') || path.endsWith('.jpeg')) {
        res.setHeader('Cache-Control', 'public, max-age=31536000');
      }
      // Allow CORS for images
      res.header('Access-Control-Allow-Origin', process.env.FRONTEND_URL || '*' );
      res.header('Access-Control-Allow-Methods', 'GET');
      res.header('Access-Control-Allow-Headers', 'Content-Type');
    }
  })
);

// Debug endpoint to check cookies
app.get("/api/debug/cookies", (req, res) => {
  console.log("Debug - All cookies:", req.cookies);
  console.log("Debug - Cookie header:", req.headers.cookie);
  console.log("Debug - Origin:", req.headers.origin);
  console.log("Debug - User-Agent:", req.headers['user-agent']);
  res.json({
    cookies: req.cookies,
    cookieHeader: req.headers.cookie,
    origin: req.headers.origin,
    hasSellerToken: !!req.cookies?.sellerToken
  });
});

// API endpoints
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
