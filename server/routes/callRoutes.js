const express = require("express");
const router = express.Router();
const callController = require("../controllers/callController");

// POST /api/calls/start - Start an outbound call
router.post("/start", callController.startCall);

// GET /api/calls/status/:callId - Get call status
router.get("/status/:callId", callController.getCallStatus);

// POST /api/calls/start-bulk - Start bulk calls
router.post("/start-bulk", callController.startBulkCalls);

module.exports = router;
