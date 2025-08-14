import jwt from "jsonwebtoken";
// seller login :/api/seller/login
export const sellerLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const envEmail = (process.env.SELLER_EMAIL || "").trim().toLowerCase();
    const envPassword = process.env.SELLER_PASSWORD || "";

    if (!envEmail || !envPassword) {
      return res
        .status(500)
        .json({ message: "Seller credentials not configured", success: false });
    }

    const inEmail = (email || "").trim().toLowerCase();
    const inPassword = password || "";

    if (inPassword === envPassword && inEmail === envEmail) {
      const token = jwt.sign({ email: inEmail }, process.env.JWT_SECRET, {
        expiresIn: "7d",
      });
      
      const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      };
      
      console.log("Setting cookie with options:", cookieOptions);
      console.log("NODE_ENV:", process.env.NODE_ENV);
      
      res.cookie("sellerToken", token, cookieOptions);
      return res
        .status(200)
        .json({ 
          message: "Login successful", 
          success: true,
          token: token // Also send token in response for fallback
        });
    } else {
      return res
        .status(400)
        .json({ message: "Invalid credentials", success: false });
    }
  } catch (error) {
    console.error("Error in sellerLogin:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// check seller auth  : /api/seller/is-auth
export const checkAuth = async (req, res) => {
  try {
    // Try to get token from cookies first, then from Authorization header
    let token = req.cookies?.sellerToken;
    
    // If no cookie token, try Authorization header
    if (!token && req.headers.authorization) {
      const authHeader = req.headers.authorization;
      if (authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }
    
    if (!token) return res.status(200).json({ success: false });
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      // Optionally ensure email matches configured seller in env
      if (decoded?.email !== process.env.SELLER_EMAIL) {
        return res.status(200).json({ success: false });
      }
      return res.status(200).json({ success: true });
    } catch (err) {
      return res.status(200).json({ success: false });
    }
  } catch (error) {
    console.error("Error in checkAuth:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
// logout seller: /api/seller/logout
export const sellerLogout = async (req, res) => {
  try {
    res.clearCookie("sellerToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      path: "/",
    });
    return res.status(200).json({
      message: "Logged out successfully",
      success: true,
    });
  } catch (error) {
    console.error("Error in logout:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
