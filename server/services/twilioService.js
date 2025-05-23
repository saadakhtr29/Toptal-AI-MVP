const twilio = require("twilio");
const dotenv = require("dotenv");
const { v4: uuidv4 } = require("uuid");

dotenv.config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioNumber = process.env.TWILIO_PHONE_NUMBER;

const client = twilio(accountSid, authToken);
const VoiceResponse = twilio.twiml.VoiceResponse;

class TwilioService {
  constructor() {
    this.client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );
    this.phoneNumber = process.env.TWILIO_PHONE_NUMBER;
  }

  // Start a new call
  async startCall(phoneNumber, callId) {
    try {
      const call = await this.client.calls.create({
        to: phoneNumber,
        from: this.phoneNumber,
        url: `${process.env.BASE_URL}/api/calls/${callId}/stream`,
        statusCallback: `${process.env.BASE_URL}/api/calls/${callId}/status`,
        statusCallbackEvent: ["initiated", "ringing", "answered", "completed"],
        statusCallbackMethod: "POST",
      });

      return {
        sid: call.sid,
        stream: this.createMediaStream(call.sid),
      };
    } catch (error) {
      console.error("Twilio Call Start Error:", error);
      throw new Error("Failed to start call");
    }
  }

  // Handle incoming call
  async handleIncomingCall(callSid, from, callId) {
    try {
      const call = await this.client.calls(callSid).fetch();

      // Update call with stream URL
      await this.client.calls(callSid).update({
        url: `${process.env.BASE_URL}/api/calls/${callId}/stream`,
        statusCallback: `${process.env.BASE_URL}/api/calls/${callId}/status`,
        statusCallbackEvent: ["initiated", "ringing", "answered", "completed"],
        statusCallbackMethod: "POST",
      });

      return {
        sid: call.sid,
        stream: this.createMediaStream(call.sid),
      };
    } catch (error) {
      console.error("Twilio Incoming Call Error:", error);
      throw new Error("Failed to handle incoming call");
    }
  }

  // Update call status
  async updateCallStatus(callSid, status) {
    try {
      await this.client.calls(callSid).update({
        status: status === "completed" ? "completed" : "in-progress",
      });
    } catch (error) {
      console.error("Twilio Status Update Error:", error);
      throw new Error("Failed to update call status");
    }
  }

  // End call
  async endCall(callId) {
    try {
      const call = await this.client.calls(callId).fetch();
      await call.update({ status: "completed" });
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
    twiml
      .connect()
      .stream({
        url: `wss://${process.env.BASE_URL}/api/streams/${streamSid}`,
      });
    return twiml.toString();
  }
}

// Export a singleton instance
module.exports = new TwilioService();
