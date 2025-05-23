const twilioService = require("../services/twilioService");
const streamProcessor = require("../services/streamProcessor");
const conversationMemory = require("../utils/conversationMemory");
const geminiService = require("../services/geminiService");
const textToSpeech = require("../services/textToSpeech");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

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

class VoiceAgentController {
  // Start a new voice agent session
  async startSession(req, res) {
    try {
      const { context } = req.body;

      // Create session record
      const session = await prisma.interaction.create({
        data: {
          type: "VOICE_AGENT",
          status: "ACTIVE",
          metadata: {
            context,
          },
        },
      });

      // Initialize conversation
      await geminiService.getConversation(session.id);

      res.json({
        sessionId: session.id,
        status: "active",
      });
    } catch (error) {
      console.error("Session Start Error:", error);
      res.status(500).json({
        error: "Failed to start voice agent session",
      });
    }
  }

  // Handle voice agent message
  async handleMessage(req, res) {
    try {
      const { sessionId } = req.params;
      const { message } = req.body;

      // Get session details
      const session = await prisma.interaction.findUnique({
        where: { id: sessionId },
      });

      if (!session) {
        return res.status(404).json({
          error: "Session not found",
        });
      }

      // Generate AI response
      const { response, context } = await geminiService.generateResponse(
        sessionId,
        message
      );

      // Convert response to speech
      const audioResponse = await textToSpeech.synthesizeSpeech(response);

      // Update session with message
      await prisma.interaction.update({
        where: { id: sessionId },
        data: {
          transcript: {
            push: {
              timestamp: new Date(),
              text: message,
              response,
            },
          },
          metadata: {
            ...session.metadata,
            context,
          },
        },
      });

      res.json({
        sessionId,
        response,
        audioResponse,
      });
    } catch (error) {
      console.error("Message Handling Error:", error);
      res.status(500).json({
        error: "Failed to handle message",
      });
    }
  }

  // End voice agent session
  async endSession(req, res) {
    try {
      const { sessionId } = req.params;

      // Get session details
      const session = await prisma.interaction.findUnique({
        where: { id: sessionId },
      });

      if (!session) {
        return res.status(404).json({
          error: "Session not found",
        });
      }

      // Clear conversation memory
      geminiService.clearConversation(sessionId);

      // Update session status
      await prisma.interaction.update({
        where: { id: sessionId },
        data: {
          status: "COMPLETED",
          endedAt: new Date(),
        },
      });

      res.json({
        status: "completed",
      });
    } catch (error) {
      console.error("Session End Error:", error);
      res.status(500).json({
        error: "Failed to end session",
      });
    }
  }

  // Get session status
  async getSessionStatus(req, res) {
    try {
      const { sessionId } = req.params;

      // Get session details
      const session = await prisma.interaction.findUnique({
        where: { id: sessionId },
      });

      if (!session) {
        return res.status(404).json({
          error: "Session not found",
        });
      }

      res.json({
        sessionId: session.id,
        status: session.status,
        transcript: session.transcript,
      });
    } catch (error) {
      console.error("Session Status Error:", error);
      res.status(500).json({
        error: "Failed to get session status",
      });
    }
  }

  // Generate interview questions
  async generateInterviewQuestions(req, res) {
    try {
      const { role } = req.body;

      const questions = await geminiService.generateInterviewQuestions(role);

      res.json({
        questions,
      });
    } catch (error) {
      console.error("Question Generation Error:", error);
      res.status(500).json({
        error: "Failed to generate interview questions",
      });
    }
  }

  // Evaluate interview
  async evaluateInterview(req, res) {
    try {
      const { role, questions, answers } = req.body;

      const evaluation = await geminiService.evaluateInterview(
        role,
        questions,
        answers
      );

      res.json({
        evaluation,
      });
    } catch (error) {
      console.error("Interview Evaluation Error:", error);
      res.status(500).json({
        error: "Failed to evaluate interview",
      });
    }
  }
}

module.exports = new VoiceAgentController();
