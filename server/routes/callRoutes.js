const express = require("express");
const router = express.Router();
const callController = require("../controllers/callController");
const {
  authMiddleware,
  verifyToken,
  checkRole,
  checkInteractionAccess,
} = require("../middleware/authMiddleware");

// POST /api/calls/start - Start an outbound call
router.post("/start", (req, res) => callController.startCall(req, res));

// GET /api/calls/status/:callId - Get call status
router.get("/status/:callId", (req, res) =>
  callController.getCallStatus(req, res)
);

// POST /api/calls/start-bulk - Start bulk calls
router.post("/start-bulk", (req, res) =>
  callController.startBulkCalls(req, res)
);

// Initialize a new call
router.post("/initiate", authMiddleware, callController.initiateCall);

// Handle incoming call (no auth required)
router.post("/incoming", callController.handleIncomingCall);

// Update call status (no auth required)
router.post("/:callId/status", callController.updateCallStatus);

// End call
router.post("/:callId/end", authMiddleware, callController.endCall);

// Get call status
router.get("/:callId/status", authMiddleware, callController.getCallStatus);

// Handle media stream
router.post(
  "/:callId/stream",
  verifyToken,
  checkRole(["ADMIN", "RECRUITER"]),
  checkInteractionAccess,
  callController.handleMediaStream
);

module.exports = router;
