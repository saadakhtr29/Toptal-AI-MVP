const express = require("express");
const router = express.Router();
const voiceAgentController = require("../controllers/voiceAgentController");

// POST /api/twilio/voice - Handle incoming voice calls
router.post("/voice", voiceAgentController.handleIncomingCall);

// POST /api/twilio/stream - Handle media streams
router.post("/stream", voiceAgentController.handleMediaStream);

module.exports = router;
