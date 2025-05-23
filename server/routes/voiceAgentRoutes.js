const express = require("express");
const router = express.Router();
const voiceAgentController = require("../controllers/voiceAgentController");
const authMiddleware = require("../middleware/auth");

// Start voice agent session
router.post(
  "/sessions",
  authMiddleware.verifyToken,
  authMiddleware.checkRole(["ADMIN", "RECRUITER"]),
  voiceAgentController.startSession
);

// Handle voice agent message
router.post(
  "/sessions/:sessionId/messages",
  authMiddleware.verifyToken,
  authMiddleware.checkRole(["ADMIN", "RECRUITER"]),
  authMiddleware.checkInteractionAccess,
  voiceAgentController.handleMessage
);

// End voice agent session
router.post(
  "/sessions/:sessionId/end",
  authMiddleware.verifyToken,
  authMiddleware.checkRole(["ADMIN", "RECRUITER"]),
  authMiddleware.checkInteractionAccess,
  voiceAgentController.endSession
);

// Get session status
router.get(
  "/sessions/:sessionId/status",
  authMiddleware.verifyToken,
  authMiddleware.checkRole(["ADMIN", "RECRUITER"]),
  authMiddleware.checkInteractionAccess,
  voiceAgentController.getSessionStatus
);

// Generate interview questions
router.post(
  "/questions/generate",
  authMiddleware.verifyToken,
  authMiddleware.checkRole(["ADMIN", "RECRUITER"]),
  voiceAgentController.generateInterviewQuestions
);

// Evaluate interview
router.post(
  "/evaluate",
  authMiddleware.verifyToken,
  authMiddleware.checkRole(["ADMIN", "RECRUITER"]),
  voiceAgentController.evaluateInterview
);

module.exports = router;
