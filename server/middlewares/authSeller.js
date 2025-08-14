import jwt from "jsonwebtoken";

export const authSeller = async (req, res, next) => {
  console.log("AuthSeller middleware - Cookies received:", req.cookies);
  console.log("AuthSeller middleware - Headers:", req.headers.cookie);
  console.log("AuthSeller middleware - Authorization header:", req.headers.authorization);
  console.log("AuthSeller middleware - Origin:", req.headers.origin);
  
  // Try to get token from cookies first, then from Authorization header
  let token = req.cookies?.sellerToken;
  
  // If no cookie token, try Authorization header
  if (!token && req.headers.authorization) {
    const authHeader = req.headers.authorization;
    if (authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
      console.log("AuthSeller middleware - Token from Authorization header");
    }
  }
  
  if (!token) {
    console.log("AuthSeller middleware - No token found in cookies or headers");
    return res.status(401).json({ 
      message: "Unauthorized - No token found", 
      success: false,
      debug: {
        hasCookies: !!req.cookies,
        cookieKeys: Object.keys(req.cookies || {}),
        hasAuthHeader: !!req.headers.authorization
      }
    });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("AuthSeller middleware - Decoded token:", decoded);
    console.log("AuthSeller middleware - Expected email:", process.env.SELLER_EMAIL);
    
    if (decoded.email === process.env.SELLER_EMAIL) {
      console.log("AuthSeller middleware - Authentication successful");
      req.seller = decoded; // Add seller info to request
      return next();
    } else {
      console.log("AuthSeller middleware - Email mismatch");
      return res.status(403).json({ 
        message: "Forbidden - Email mismatch", 
        success: false,
        debug: {
          decodedEmail: decoded.email,
          expectedEmail: process.env.SELLER_EMAIL
        }
      });
    }
  } catch (error) {
    console.error("Error in authSeller middleware:", error);
    return res.status(401).json({ 
      message: "Invalid token", 
      success: false,
      error: error.message
    });
  }
};
