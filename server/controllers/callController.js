const streamProcessor = require("../services/streamProcessor");
const twilioService = require("../services/twilioService");
const speechToTextService = require("../services/speechToText");
const geminiService = require("../services/geminiService");
const { CallSession, Interaction } = require("../models");
const { v4: uuidv4 } = require("uuid");
const twilio = require("twilio");
const { VoiceResponse } = twilio.twiml;

// Create a singleton instance of the active calls map
const activeCalls = new Map();

class CallController {
  constructor() {
    this.streamProcessor = streamProcessor;
    this.client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );
  }

  // Start a single call
  async startCall(req, res) {
    try {
      const { phoneNumber, context } = req.body;
      const callId = uuidv4();

      // Generate TwiML URL using ngrok URL
      const baseUrl = process.env.NGROK_URL;
      if (!baseUrl) {
        throw new Error("NGROK_URL environment variable is not set");
      }
      const twimlUrl = `${baseUrl}/api/calls/voice`;

      console.log("Starting call with TwiML URL:", twimlUrl);

      // Start Twilio call
      const call = await twilioService.startCall(phoneNumber, callId, twimlUrl);

      // Store call information
      activeCalls.set(callId, {
        callSid: call.sid,
        phoneNumber,
        context,
        status: "initiated",
      });

      res.json({
        success: true,
        callId,
        status: "initiated",
        twilioCallSid: call.sid,
      });
    } catch (error) {
      console.error("Call Start Error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to start call",
      });
    }
  }

  // Initialize a new call
  async initiateCall(req, res) {
    try {
      const { phoneNumber, context } = req.body;
      const callId = uuidv4();

      // Generate TwiML URL using ngrok URL
      const baseUrl = process.env.NGROK_URL;
      if (!baseUrl) {
        throw new Error("NGROK_URL environment variable is not set");
      }
      const twimlUrl = `${baseUrl}/api/calls/voice`;

      console.log("Starting call with TwiML URL:", twimlUrl);

      // Start Twilio call
      const call = await twilioService.startCall(phoneNumber, callId, twimlUrl);

      // Store call information
      activeCalls.set(callId, {
        callSid: call.sid,
        phoneNumber,
        context,
        status: "initiated",
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
      const { CallSid: callSid, From: from } = req.body;
      console.log(`Handling incoming call: ${callSid} with callId: ${callSid}`);

      // Create or update call session
      const [callSession] = await CallSession.findOrCreate({
        where: { callSid },
        defaults: {
          status: "in-progress",
          startTime: new Date(),
          phoneNumber: from,
          context: { direction: "inbound" },
        },
      });

      // Start stream processing
      try {
        await streamProcessor.processStream(callSid, req, callSid, {
          voice: "Polly.Amy",
          audioConfig: {
            audioEncoding: "LINEAR16",
            sampleRateHertz: 16000,
            effectsProfileId: ["telephony-class-application"],
          },
        });
      } catch (error) {
        console.error("Stream Processing Error:", error);
        // Don't throw the error, just log it
      }

      // Generate TwiML response
      const response = new VoiceResponse();
      response.say("Welcome to Toptal AI. Please wait while we connect you.");
      response.pause({ length: 1 });
      response.say("You are now connected. How can I help you today?");

      // Set response headers
      res.set("Content-Type", "text/xml");
      res.send(response.toString());
    } catch (error) {
      console.error("Incoming Call Error:", error);
      // Send error response
      const response = new VoiceResponse();
      response.say("Sorry, an error occurred. Please try again later.");
      res.set("Content-Type", "text/xml");
      res.send(response.toString());
    }
  }

  // Handle call status updates
  async handleCallStatus(req, res) {
    try {
      const { CallSid: callSid, CallStatus: status } = req.body;
      console.log(`Call ${callSid} status updated to: ${status}`);

      // Update call session
      const [callSession, created] = await CallSession.findOrCreate({
        where: { callSid },
        defaults: {
          status,
          startTime: new Date(),
          context: { direction: "inbound" },
        },
      });

      if (!created) {
        await callSession.update({
          status,
          ...(status === "completed" && {
            endTime: new Date(),
            duration: Math.floor(
              (new Date() - new Date(callSession.startTime)) / 1000
            ),
          }),
        });
      }

      // Stop stream if call is completed
      if (status === "completed") {
        try {
          await streamProcessor.stopStream(callSid);
        } catch (error) {
          console.error("Error stopping stream:", error);
          // Don't throw the error, just log it
        }
      }

      // Always send 200 response to Twilio
      res.status(200).send();
    } catch (error) {
      console.error("Call Status Error:", error);
      // Always send 200 response to Twilio even if there's an error
      res.status(200).send();
    }
  }

  // Handle call recording
  async handleCallRecording(req, res) {
    try {
      const { CallSid: callSid, RecordingUrl: recordingUrl } = req.body;
      console.log(`Recording received for call ${callSid}: ${recordingUrl}`);

      // Update call session with recording URL
      await CallSession.update(
        {
          context: sequelize.literal(
            `jsonb_set(COALESCE(context, '{}'::jsonb), '{recordingUrl}', '"${recordingUrl}"'::jsonb)`
          ),
        },
        {
          where: { callSid },
        }
      );

      res.status(200).send();
    } catch (error) {
      console.error("Call Recording Error:", error);
      res.status(200).send();
    }
  }

  // Start bulk calls
  async startBulkCalls(req, res) {
    try {
      const { phoneNumbers = [], context = {} } = req.body;
      if (!Array.isArray(phoneNumbers) || phoneNumbers.length === 0) {
        return res.status(400).json({ error: "No phone numbers provided" });
      }

      // Get ngrok URL
      const baseUrl = process.env.NGROK_URL;
      if (!baseUrl) {
        throw new Error("NGROK_URL environment variable is not set");
      }

      const callIds = [];
      for (const phoneNumber of phoneNumbers) {
        try {
          const callId = uuidv4();
          const twimlUrl = `${baseUrl}/api/calls/voice`;

          console.log("Starting bulk call with TwiML URL:", twimlUrl);

          const call = await twilioService.startCall(
            phoneNumber,
            callId,
            twimlUrl
          );

          // Store call information
          activeCalls.set(callId, {
            callSid: call.sid,
            phoneNumber,
            context,
            status: "initiated",
          });

          callIds.push(callId);
        } catch (err) {
          console.error(`Failed to start call for ${phoneNumber}:`, err);
        }
      }
      res.json({ callIds });
    } catch (error) {
      console.error("Bulk Call Error:", error);
      res.status(500).json({ error: "Failed to start bulk calls" });
    }
  }

  // End call
  async endCall(req, res) {
    try {
      const { callId } = req.params;
      const callInfo = activeCalls.get(callId);

      if (!callInfo) {
        return res.status(404).json({ error: "Call not found" });
      }

      // End call in Twilio
      await twilioService.endCall(callInfo.callSid);

      // Update call session
      await CallSession.update(
        {
          status: "COMPLETED",
          endTime: new Date(),
        },
        { where: { callSid: callInfo.callSid } }
      );

      // Clean up
      activeCalls.delete(callId);
      await this.streamProcessor.stopStream(callId);

      res.status(200).json({ message: "Call ended successfully" });
    } catch (error) {
      console.error("End Call Error:", error);
      res.status(500).json({ error: "Failed to end call" });
    }
  }

  // Get call status
  async getCallStatus(req, res) {
    try {
      const { callId } = req.params;
      const callInfo = activeCalls.get(callId);

      if (!callInfo) {
        return res.status(404).json({
          success: false,
          error: "Call not found",
        });
      }

      const status = this.streamProcessor.getStreamStatus(callId);

      res.json({
        success: true,
        status: {
          ...callInfo,
          streamStatus: status,
        },
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
      const { CallSid } = req.query;
      const callSession = await CallSession.findOne({
        where: { callSid: CallSid },
      });

      if (!callSession) {
        return res.status(404).json({ error: "Call session not found" });
      }

      // Handle media stream logic here
      res.status(200).json({ message: "Media stream handled" });
    } catch (error) {
      console.error("Media Stream Error:", error);
      res.status(500).json({ error: "Failed to handle media stream" });
    }
  }
}

module.exports = new CallController();
