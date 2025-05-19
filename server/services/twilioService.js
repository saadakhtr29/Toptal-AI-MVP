const twilio = require("twilio");
const dotenv = require("dotenv");

dotenv.config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioNumber = process.env.TWILIO_PHONE_NUMBER;

const client = twilio(accountSid, authToken);
const VoiceResponse = twilio.twiml.VoiceResponse;

exports.generateInitialTwiML = async () => {
  const twiml = new VoiceResponse();

  // Enable media streams
  twiml.connect().stream({
    url: `${process.env.BASE_URL}/api/twilio/stream`,
  });

  return twiml;
};

exports.createOutboundCall = async (phoneNumber) => {
  try {
    const call = await client.calls.create({
      to: phoneNumber,
      from: twilioNumber,
      url: `${process.env.BASE_URL}/api/twilio/voice`,
    });

    return call;
  } catch (error) {
    console.error("Error creating outbound call:", error);
    throw error;
  }
};

exports.getCallStatus = async (callSid) => {
  try {
    const call = await client.calls(callSid).fetch();
    return call.status;
  } catch (error) {
    console.error("Error getting call status:", error);
    throw error;
  }
};
