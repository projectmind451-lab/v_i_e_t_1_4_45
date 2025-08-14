import jwt from "jsonwebtoken";

export const authSeller = async (req, res, next) => {
  // Try to get token from cookies first, then from Authorization header
  let token = req.cookies?.sellerToken;
  
  // If no cookie token, try Authorization header
  if (!token && req.headers.authorization) {
    const authHeader = req.headers.authorization;
    if (authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
  }
  
  if (!token) {
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
    
    if (decoded.email === process.env.SELLER_EMAIL) {
      req.seller = decoded; // Add seller info to request
      return next();
    } else {
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
