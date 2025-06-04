const twilio = require("twilio");
const dotenv = require("dotenv");
const { v4: uuidv4 } = require("uuid");
const VoiceResponse = twilio.twiml.VoiceResponse;

dotenv.config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioNumber = process.env.TWILIO_PHONE_NUMBER;
const ngrokUrl = process.env.NGROK_URL;

if (!accountSid || !authToken || !twilioNumber) {
  console.error("Missing required Twilio environment variables");
  process.exit(1);
}

if (!ngrokUrl) {
  console.error("Missing NGROK_URL environment variable");
  process.exit(1);
}

// Configure Twilio client with increased timeout and retry options
const client = twilio(accountSid, authToken, {
  timeout: 60000, // Increase timeout to 60 seconds
  retryLimit: 3, // Add retry logic
  region: "us1", // Specify region
});

class TwilioService {
  constructor() {
    this.client = client;
    this.phoneNumber = twilioNumber;
  }

  // Generate TwiML for voice call
  generateVoiceResponse(message) {
    const response = new VoiceResponse();
    response.say({ voice: "Polly.Amy" }, message);
    return response.toString();
  }

  // Start a call
  async startCall(phoneNumber, callId, twimlUrl) {
    try {
      console.log("Starting call to", phoneNumber, "with TwiML URL:", twimlUrl);

      // Ensure the URL is properly formatted
      const baseUrl = process.env.NGROK_URL || "http://localhost:8080";
      const statusCallbackUrl = `${baseUrl}/api/calls/status`;

      // Validate phone number format
      if (!phoneNumber.match(/^\+[1-9]\d{1,14}$/)) {
        throw new Error("Invalid phone number format");
      }

      const call = await this.client.calls.create({
        to: phoneNumber,
        from: this.phoneNumber,
        url: twimlUrl,
        statusCallback: statusCallbackUrl,
        statusCallbackEvent: ["initiated", "ringing", "answered", "completed"],
        statusCallbackMethod: "POST",
        timeout: 30, // 30 seconds timeout for the call
      });

      console.log("Call started with SID:", call.sid);
      return call;
    } catch (error) {
      console.error("Error starting call:", error);
      throw error;
    }
  }

  // Handle incoming call
  async handleIncomingCall(req, res) {
    try {
      const twiml = new VoiceResponse();

      // Add initial greeting
      twiml.say(
        {
          voice: "Polly.Amy",
          language: "en-GB",
        },
        "Hello, Vipin. Thank you for talking to the Toptal Scoutly AI. We'll get back to you."
      );

      // Connect to media stream
      const connect = twiml.connect();
      connect.stream({
        url: `wss://${process.env.NGROK_URL.replace(
          "https://",
          ""
        )}/api/calls/stream`,
      });

      return twiml;
    } catch (error) {
      console.error("Error handling incoming call:", error);
      const twiml = new VoiceResponse();
      twiml.say(
        {
          voice: "Polly.Amy",
          language: "en-GB",
        },
        "We apologize, but an error has occurred. Please try again later."
      );
      return twiml;
    }
  }

  // Handle call status updates
  async handleCallStatus(callSid, status) {
    try {
      console.log(`Call ${callSid} status updated to: ${status}`);
      // Add any additional status handling logic here
    } catch (error) {
      console.error("Error handling call status:", error);
      throw error;
    }
  }

  // End call
  async endCall(callSid) {
    try {
      if (!callSid) {
        throw new Error("Call SID is required");
      }
      await this.client.calls(callSid).update({ status: "completed" });
      console.log(`Call ${callSid} ended successfully`);
    } catch (error) {
      console.error("Error ending call:", error);
      throw error;
    }
  }

  // Create media stream
  createMediaStream(callSid) {
    try {
      if (!callSid) {
        throw new Error("Call SID is required");
      }
      return this.client.calls(callSid).streams.create({
        name: `stream-${uuidv4()}`,
        track: "both_tracks",
        statusCallback: `${
          process.env.NGROK_URL || "http://localhost:8080"
        }/api/calls/${callSid}/stream/status`,
        statusCallbackMethod: "POST",
      });
    } catch (error) {
      console.error("Error creating media stream:", error);
      throw error;
    }
  }

  // Generate TwiML for stream
  generateStreamTwiML(streamSid) {
    try {
      const twiml = new VoiceResponse();
      twiml.connect().stream({
        url: `wss://${
          process.env.NGROK_URL.replace("https://", "") || "localhost:8080"
        }/api/streams/${streamSid}`,
      });
      return twiml.toString();
    } catch (error) {
      console.error("Error generating stream TwiML:", error);
      throw error;
    }
  }
}

// Export a singleton instance
module.exports = new TwilioService();
