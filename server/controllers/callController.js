const twilioService = require("../services/twilioService");

exports.startCall = async (req, res) => {
  try {
    const { phoneNumber } = req.body;

    if (!phoneNumber) {
      return res.status(400).json({ error: "Phone number is required" });
    }

    const call = await twilioService.createOutboundCall(phoneNumber);

    res.json({
      success: true,
      callSid: call.sid,
      status: call.status,
    });
  } catch (error) {
    console.error("Error starting call:", error);
    res.status(500).json({ error: "Failed to start call" });
  }
};

exports.getCallStatus = async (req, res) => {
  try {
    const { callId } = req.params;
    const status = await twilioService.getCallStatus(callId);

    res.json({ status });
  } catch (error) {
    console.error("Error getting call status:", error);
    res.status(500).json({ error: "Failed to get call status" });
  }
};

exports.startBulkCalls = async (req, res) => {
  try {
    const { phoneNumbers } = req.body;

    if (!Array.isArray(phoneNumbers) || phoneNumbers.length === 0) {
      return res.status(400).json({ error: "No phone numbers provided" });
    }

    const results = [];
    for (const number of phoneNumbers) {
      try {
        const call = await twilioService.createOutboundCall(number);
        results.push({ number, callSid: call.sid, status: call.status });
      } catch (error) {
        console.error(`Failed to call ${number}`, error);
        results.push({ number, error: error.message });
      }
    }

    res.json({ success: true, results });
  } catch (error) {
    console.error("Bulk call error:", error);
    res.status(500).json({ error: "Failed to start bulk calls" });
  }
};