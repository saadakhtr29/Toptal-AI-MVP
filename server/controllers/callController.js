const streamProcessor = require("../services/streamProcessor");
const twilioService = require("../services/twilioService");
const { v4: uuidv4 } = require("uuid");

class CallController {
  constructor() {
    this.streamProcessor = streamProcessor;
  }

  // Initialize a new call
  async initiateCall(req, res) {
    try {
      const { phoneNumber, context } = req.body;
      const callId = uuidv4();

      // Start Twilio call
      const call = await twilioService.startCall(phoneNumber, callId);

      // Initialize stream processing
      await this.streamProcessor.processStream(callId, call.stream, callId, {
        voice: {
          languageCode: "en-US",
          name: "en-US-Neural2-F",
          ssmlGender: "FEMALE",
        },
        audioConfig: {
          audioEncoding: "MP3",
          speakingRate: 1.0,
          pitch: 0,
          volumeGainDb: 0,
        },
      });

      res.json({
        success: true,
        callId,
        status: "initiated",
        twilioCallSid: call.sid,
      });
    } catch (error) {
      console.error("Call Initiation Error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to initiate call",
      });
    }
  }

  // Handle incoming call
  async handleIncomingCall(req, res) {
    try {
      const { CallSid, From } = req.body;
      const callId = uuidv4();

      // Start Twilio call handling
      const call = await twilioService.handleIncomingCall(
        CallSid,
        From,
        callId
      );

      // Initialize stream processing
      await this.streamProcessor.processStream(callId, call.stream, callId, {
        voice: {
          languageCode: "en-US",
          name: "en-US-Neural2-F",
          ssmlGender: "FEMALE",
        },
        audioConfig: {
          audioEncoding: "MP3",
          speakingRate: 1.0,
          pitch: 0,
          volumeGainDb: 0,
        },
      });

      res.json({
        success: true,
        callId,
        status: "in-progress",
        twilioCallSid: CallSid,
      });
    } catch (error) {
      console.error("Incoming Call Error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to handle incoming call",
      });
    }
  }

  // Update call status
  async updateCallStatus(req, res) {
    try {
      const { CallSid, CallStatus } = req.body;
      const callId = req.params.callId;

      // Update Twilio call status
      await twilioService.updateCallStatus(CallSid, CallStatus);

      if (CallStatus === "completed" || CallStatus === "failed") {
        // Stop stream processing
        await this.streamProcessor.stopStream(callId);
      }

      res.json({
        success: true,
        status: CallStatus,
      });
    } catch (error) {
      console.error("Call Status Update Error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to update call status",
      });
    }
  }

  // End call
  async endCall(req, res) {
    try {
      const { callId } = req.params;

      // Stop stream processing
      const summary = await this.streamProcessor.stopStream(callId);

      // End Twilio call
      await twilioService.endCall(callId);

      res.json({
        success: true,
        status: "ended",
        summary,
      });
    } catch (error) {
      console.error("Call End Error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to end call",
      });
    }
  }

  // Get call status
  async getCallStatus(req, res) {
    try {
      const { callId } = req.params;
      const status = this.streamProcessor.getStreamStatus(callId);

      if (!status) {
        return res.status(404).json({
          success: false,
          error: "Call not found",
        });
      }

      res.json({
        success: true,
        status,
      });
    } catch (error) {
      console.error("Call Status Error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to get call status",
      });
    }
  }

  // Handle media stream
  async handleMediaStream(req, res) {
    try {
      const { callId } = req.params;
      const { mediaStreamSid } = req.body;

      // Get stream status
      const status = this.streamProcessor.getStreamStatus(callId);
      if (!status) {
        return res.status(404).json({
          success: false,
          error: "Call not found",
        });
      }

      // Generate TwiML for stream
      const twiml = twilioService.generateStreamTwiML(mediaStreamSid);

      res.type("text/xml");
      res.send(twiml);
    } catch (error) {
      console.error("Media Stream Error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to handle media stream",
      });
    }
  }
}

module.exports = new CallController();
