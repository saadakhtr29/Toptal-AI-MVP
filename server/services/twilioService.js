const twilio = require("twilio");
const dotenv = require("dotenv");
const { v4: uuidv4 } = require("uuid");
const VoiceResponse = twilio.twiml.VoiceResponse;

dotenv.config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioNumber = process.env.TWILIO_PHONE_NUMBER;

const client = twilio(accountSid, authToken);

class TwilioService {
  constructor() {
    this.client = client;
  }

  // Generate TwiML for voice call
  generateVoiceResponse(message) {
    const response = new VoiceResponse();
    response.say({ voice: "Polly.Amy" }, message);
    return response.toString();
  }

  // Start a new call
  async startCall(to, from, twimlUrl) {
    try {
      const call = await this.client.calls.create({
        to,
        from: process.env.TWILIO_PHONE_NUMBER,
        url: twimlUrl,
        statusCallback: `${process.env.API_URL}/api/calls/status`,
        statusCallbackEvent: ["initiated", "ringing", "answered", "completed"],
        statusCallbackMethod: "POST",
      });
      return call;
    } catch (error) {
      console.error("Twilio Call Error:", error);
      throw new Error("Failed to initiate call");
    }
  }

  // Handle incoming call
  async handleIncomingCall(req, res) {
    const response = new VoiceResponse();

    // Enable media streams
    const connect = response.connect();
    connect.stream({
      url: `wss://${req.headers.host}/api/calls/stream`,
    });

    res.type("text/xml");
    res.send(response.toString());
  }

  // Update call status
  async updateCallStatus(callSid, status) {
    try {
      const call = await this.client.calls(callSid).update({
        status: status,
      });
      return call;
    } catch (error) {
      console.error("Twilio Status Update Error:", error);
      throw new Error("Failed to update call status");
    }
  }

  // End an active call
  async endCall(callSid) {
    try {
      const call = await this.client.calls(callSid).update({
        status: "completed",
      });
      return call;
    } catch (error) {
      console.error("Twilio End Call Error:", error);
      throw new Error("Failed to end call");
    }
  }

  // Create media stream
  createMediaStream(callSid) {
    return this.client.calls(callSid).streams.create({
      name: `stream-${uuidv4()}`,
      track: "both_tracks",
      statusCallback: `${process.env.BASE_URL}/api/calls/${callSid}/stream/status`,
      statusCallbackMethod: "POST",
    });
  }

  // Generate TwiML for stream
  generateStreamTwiML(streamSid) {
    const twiml = new twilio.twiml.VoiceResponse();
    twiml.connect().stream({
      url: `wss://${process.env.BASE_URL}/api/streams/${streamSid}`,
    });
    return twiml.toString();
  }
}

// Export a singleton instance
module.exports = new TwilioService();
