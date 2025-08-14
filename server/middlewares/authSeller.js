import jwt from "jsonwebtoken";
export const authSeller = async (req, res, next) => {
  console.log("AuthSeller middleware - Cookies received:", req.cookies);
  console.log("AuthSeller middleware - Headers:", req.headers.cookie);
  
  const { sellerToken } = req.cookies;
  if (!sellerToken) {
    console.log("AuthSeller middleware - No sellerToken found");
    return res.status(401).json({ message: "Unauthorized - No token", success: false });
  }
  
  try {
    const decoded = jwt.verify(sellerToken, process.env.JWT_SECRET);
    console.log("AuthSeller middleware - Decoded token:", decoded);
    console.log("AuthSeller middleware - Expected email:", process.env.SELLER_EMAIL);
    
    if (decoded.email === process.env.SELLER_EMAIL) {
      console.log("AuthSeller middleware - Authentication successful");
      return next();
    } else {
      console.log("AuthSeller middleware - Email mismatch");
      return res.status(403).json({ message: "Forbidden - Email mismatch", success: false });
    }
  } catch (error) {
    console.error("Error in authSeller middleware:", error);
    return res.status(401).json({ message: "Invalid token", success: false });
  }
};
