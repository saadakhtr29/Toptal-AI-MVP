const admin = require("firebase-admin");

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
  });
}

// Verify Firebase token
const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split("Bearer ")[1];
    if (!token) {
      return res.status(401).json({
        success: false,
        error: "No token provided",
      });
    }

    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error("Token Verification Error:", error);
    res.status(401).json({
      success: false,
      error: "Invalid token",
    });
  }
};

// Check user role
const checkRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: "User not authenticated",
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: "Insufficient permissions",
      });
    }

    next();
  };
};

// Check interaction access
const checkInteractionAccess = async (req, res, next) => {
  try {
    const { callId } = req.params;
    const userId = req.user.uid;

    // Here you would typically check if the user has access to this call
    // For now, we'll just pass through
    next();
  } catch (error) {
    console.error("Interaction Access Check Error:", error);
    res.status(403).json({
      success: false,
      error: "Access denied",
    });
  }
};

// Combined middleware for protected routes
const authMiddleware = [verifyToken, checkRole(["ADMIN", "RECRUITER"])];

module.exports = {
  verifyToken,
  checkRole,
  checkInteractionAccess,
  authMiddleware,
};
