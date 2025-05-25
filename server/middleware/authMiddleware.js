const admin = require("../config/firebase");
const { User } = require("../models");
const { Interaction } = require("../models");

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
  });
}

// Verify Firebase token
const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    const decodedToken = await admin.auth().verifyIdToken(token);

    // Get or create user in our database
    let user = await User.findOne({ where: { firebaseUid: decodedToken.uid } });

    if (!user) {
      // Create new user if doesn't exist
      user = await User.create({
        firebaseUid: decodedToken.uid,
        email: decodedToken.email,
        name: decodedToken.name || decodedToken.email.split("@")[0],
        role: "CANDIDATE", // Default role
      });
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    console.error("Auth Error:", error);
    res.status(401).json({ error: "Invalid token" });
  }
};

// Check user role
const checkRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Insufficient permissions" });
    }

    next();
  };
};

// Check interaction access
const checkInteractionAccess = async (req, res, next) => {
  try {
    const { callId } = req.params;
    const userId = req.user.id;

    // Check if user has access to this interaction
    const interaction = await Interaction.findOne({
      where: {
        id: callId,
        userId: userId,
      },
    });

    if (!interaction) {
      return res
        .status(403)
        .json({ error: "Access denied to this interaction" });
    }

    next();
  } catch (error) {
    console.error("Access Check Error:", error);
    res.status(500).json({ error: "Error checking access" });
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
