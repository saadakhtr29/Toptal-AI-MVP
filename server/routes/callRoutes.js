const express = require("express");
const router = express.Router();
const callController = require("../controllers/callController");
const {
  verifyToken,
  checkRole,
  checkInteractionAccess,
} = require("../middleware/authMiddleware");

// Public routes (Twilio webhooks - no auth required)
router.post("/voice", (req, res) =>
  callController.handleIncomingCall(req, res)
);
router.post("/status", (req, res) => callController.handleCallStatus(req, res));
router.post("/stream", (req, res) =>
  callController.handleMediaStream(req, res)
);

// Protected routes (require authentication)
router.post("/start", verifyToken, (req, res) =>
  callController.startCall(req, res)
);
router.post("/start-bulk", verifyToken, (req, res) =>
  callController.startBulkCalls(req, res)
);
router.post("/initiate", verifyToken, (req, res) =>
  callController.initiateCall(req, res)
);
router.get("/status/:callId", verifyToken, (req, res) =>
  callController.getCallStatus(req, res)
);
router.post("/:callId/end", verifyToken, (req, res) =>
  callController.endCall(req, res)
);

module.exports = router;
