const admin = require("firebase-admin");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

class AuthMiddleware {
  constructor() {
    // Initialize Firebase Admin if not already initialized
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.applicationDefault(),
      });
    }
  }

  // Verify Firebase token
  async verifyToken(req, res, next) {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
          error: "No token provided",
        });
      }

      const token = authHeader.split("Bearer ")[1];
      const decodedToken = await admin.auth().verifyIdToken(token);

      // Get user from database
      const user = await prisma.user.findUnique({
        where: { firebaseUid: decodedToken.uid },
        include: {
          subaccounts: true,
        },
      });

      if (!user) {
        return res.status(401).json({
          error: "User not found",
        });
      }

      // Attach user to request
      req.user = user;
      next();
    } catch (error) {
      console.error("Token Verification Error:", error);
      res.status(401).json({
        error: "Invalid token",
      });
    }
  }

  // Check if user has required role
  checkRole(roles) {
    return (req, res, next) => {
      if (!req.user) {
        return res.status(401).json({
          error: "Authentication required",
        });
      }

      if (!roles.includes(req.user.role)) {
        return res.status(403).json({
          error: "Insufficient permissions",
        });
      }

      next();
    };
  }

  // Check if user has access to subaccount
  async checkSubaccountAccess(req, res, next) {
    try {
      const { subaccountId } = req.params;

      if (!req.user) {
        return res.status(401).json({
          error: "Authentication required",
        });
      }

      // Check if user has access to subaccount
      const hasAccess = req.user.subaccounts.some(
        (subaccount) => subaccount.id === subaccountId
      );

      if (!hasAccess) {
        return res.status(403).json({
          error: "No access to subaccount",
        });
      }

      next();
    } catch (error) {
      console.error("Subaccount Access Check Error:", error);
      res.status(500).json({
        error: "Failed to check subaccount access",
      });
    }
  }

  // Check if user has access to interaction
  async checkInteractionAccess(req, res, next) {
    try {
      const { interactionId } = req.params;

      if (!req.user) {
        return res.status(401).json({
          error: "Authentication required",
        });
      }

      // Get interaction details
      const interaction = await prisma.interaction.findUnique({
        where: { id: interactionId },
        include: {
          subaccount: true,
        },
      });

      if (!interaction) {
        return res.status(404).json({
          error: "Interaction not found",
        });
      }

      // Check if user has access to interaction's subaccount
      const hasAccess = req.user.subaccounts.some(
        (subaccount) => subaccount.id === interaction.subaccountId
      );

      if (!hasAccess) {
        return res.status(403).json({
          error: "No access to interaction",
        });
      }

      next();
    } catch (error) {
      console.error("Interaction Access Check Error:", error);
      res.status(500).json({
        error: "Failed to check interaction access",
      });
    }
  }
}

module.exports = new AuthMiddleware();
