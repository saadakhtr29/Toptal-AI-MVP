const express = require("express");
const router = express.Router();
const analyticsController = require("../controllers/analyticsController");
const authMiddleware = require("../middleware/authMiddleware");

// Get call analytics
router.get(
  "/calls/:callId",
  authMiddleware.verifyToken,
  authMiddleware.checkRole(["ADMIN", "RECRUITER"]),
  analyticsController.getCallAnalytics
);

// Get user analytics
router.get(
  "/users",
  authMiddleware.verifyToken,
  authMiddleware.checkRole(["ADMIN", "RECRUITER"]),
  analyticsController.getUserAnalytics
);

// Get system analytics (admin only)
router.get(
  "/system",
  authMiddleware.verifyToken,
  authMiddleware.checkRole(["ADMIN"]),
  analyticsController.getSystemAnalytics
);

// Track call metrics
router.post(
  "/calls/:callId/metrics",
  authMiddleware.verifyToken,
  authMiddleware.checkRole(["ADMIN", "RECRUITER"]),
  analyticsController.trackCallMetrics
);

// Record call
router.post(
  "/calls/:callId/record",
  authMiddleware.verifyToken,
  authMiddleware.checkRole(["ADMIN", "RECRUITER"]),
  analyticsController.recordCall
);

module.exports = router;
