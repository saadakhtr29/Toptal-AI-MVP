const twilioService = require("../services/twilioService");
const streamProcessor = require("../services/streamProcessor");
const conversationMemory = require("../utils/conversationMemory");

exports.handleIncomingCall = async (req, res) => {
  try {
    const twiml = await twilioService.generateInitialTwiML();
    res.type("text/xml");
    res.send(twiml.toString());
  } catch (error) {
    console.error("Error handling incoming call:", error);
    res.status(500).send("Error handling call");
  }
};

exports.handleMediaStream = async (req, res) => {
  try {
    const { CallSid, MediaStreamSid } = req.body;

    // Initialize conversation memory for this call
    conversationMemory.initialize(CallSid);

    // Process the media stream
    await streamProcessor.processStream(CallSid, MediaStreamSid);

    res.status(200).send("Stream processing started");
  } catch (error) {
    console.error("Error handling media stream:", error);
    res.status(500).send("Error processing stream");
  }
};
