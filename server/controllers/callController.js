const streamProcessor = require("../services/streamProcessor");
const twilioService = require("../services/twilioService");
const speechToTextService = require("../services/speechToText");
const geminiService = require("../services/geminiService");
const { CallSession, Interaction } = require("../models");
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
      const callSid = req.body.CallSid;
      const sessionId = uuidv4();

      // Create new call session
      const callSession = await CallSession.create({
        sessionId,
        callSid,
        status: "IN_PROGRESS",
        startTime: new Date(),
      });

      // Generate initial greeting
      const greeting = await geminiService.generateResponse(
        "Generate a professional greeting for an AI recruiter"
      );

      // Generate TwiML response
      const twiml = twilioService.generateVoiceResponse(greeting.text);

      res.type("text/xml");
      res.send(twiml);
    } catch (error) {
      console.error("Incoming Call Error:", error);
      res.status(500).send("Error handling incoming call");
    }
  }

  // Handle call status updates
  async handleCallStatus(req, res) {
    try {
      const { CallSid, CallStatus } = req.body;

      // Update call session status
      await CallSession.update(
        { status: CallStatus.toUpperCase() },
        { where: { callSid: CallSid } }
      );

      res.status(200).send("Status updated");
    } catch (error) {
      console.error("Call Status Update Error:", error);
      res.status(500).send("Error updating call status");
    }
  }

  // End call
  async endCall(req, res) {
    try {
      const { callSid } = req.params;

      // End call in Twilio
      await twilioService.endCall(callSid);

      // Update call session
      await CallSession.update(
        {
          status: "COMPLETED",
          endTime: new Date(),
        },
        { where: { callSid } }
      );

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
      const { CallSid } = req.query;
      const callSession = await CallSession.findOne({
        where: { callSid: CallSid },
      });

      if (!callSession) {
        throw new Error("Call session not found");
      }

      // Set up WebSocket connection
      const ws = await new Promise((resolve, reject) => {
        const wss = new WebSocket.Server({ noServer: true });
        wss.on("connection", (ws) => {
          resolve(ws);
        });
      });

      // Handle incoming audio stream
      req.on("data", async (chunk) => {
        try {
          // Convert audio to text
          const transcription = await speechToTextService.transcribeAudio(
            chunk
          );

          // Generate AI response
          const response = await geminiService.generateResponse(
            transcription.text,
            { sessionId: callSession.sessionId }
          );

          // Convert response to speech
          const audioResponse = await textToSpeechService.synthesizeSpeech(
            response.text
          );

          // Send audio back to caller
          ws.send(audioResponse);

          // Log interaction
          await Interaction.create({
            sessionId: callSession.sessionId,
            type: "VOICE",
            input: transcription.text,
            output: response.text,
            metadata: {
              confidence: transcription.confidence,
              duration: Date.now() - callSession.startTime,
            },
          });
        } catch (error) {
          console.error("Media Stream Processing Error:", error);
        }
      });

      res.status(200).send("Stream connected");
    } catch (error) {
      console.error("Media Stream Error:", error);
      res.status(500).send("Error handling media stream");
    }
  }
}

module.exports = new CallController();
