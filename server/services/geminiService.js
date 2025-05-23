const { GoogleGenerativeAI } = require("@google/generative-ai");
const conversationMemory = require("../utils/conversationMemory");

class GeminiService {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-pro" });
    this.chat = this.model.startChat({
      history: [],
      generationConfig: {
        maxOutputTokens: 2048,
        temperature: 0.7,
        topP: 0.8,
        topK: 40,
      },
    });
  }

  // Generate a response based on the conversation context
  async generateResponse(sessionId, userMessage) {
    try {
      // Get conversation context
      const context = conversationMemory.getContext(sessionId);
      const history = conversationMemory.getHistory(sessionId);

      // Prepare the prompt with context
      const prompt = this.preparePrompt(context, history, userMessage);

      // Generate response using Gemini
      const result = await this.chat.sendMessage(prompt);
      const response = result.response.text();

      // Add messages to conversation history
      conversationMemory.addMessage(sessionId, userMessage, "user");
      conversationMemory.addMessage(sessionId, response, "assistant");

      return {
        response,
        context: conversationMemory.getContext(sessionId),
      };
    } catch (error) {
      console.error("Gemini Response Generation Error:", error);
      throw new Error("Failed to generate response");
    }
  }

  // Generate interview questions
  async generateQuestions(context) {
    try {
      const prompt = this.prepareQuestionPrompt(context);
      const result = await this.model.generateContent(prompt);
      const response = result.response.text();

      // Parse the response to extract questions
      const questions = this.parseQuestions(response);

      return {
        questions,
        context,
      };
    } catch (error) {
      console.error("Question Generation Error:", error);
      throw new Error("Failed to generate questions");
    }
  }

  // Evaluate interview responses
  async evaluateResponses(context, questions, answers) {
    try {
      const prompt = this.prepareEvaluationPrompt(context, questions, answers);
      const result = await this.model.generateContent(prompt);
      const response = result.response.text();

      // Parse the evaluation results
      const evaluation = this.parseEvaluation(response);

      return {
        evaluation,
        context,
      };
    } catch (error) {
      console.error("Response Evaluation Error:", error);
      throw new Error("Failed to evaluate responses");
    }
  }

  // Prepare prompt with context and history
  preparePrompt(context, history, userMessage) {
    const rolePrompt = `You are an AI ${context.role} for ${context.company}. 
    You are interviewing for a ${context.position} position. 
    Required skills: ${context.skills.join(", ")}.`;

    const historyPrompt = history
      .map(
        (msg) =>
          `${msg.type === "user" ? "Candidate" : "Interviewer"}: ${msg.content}`
      )
      .join("\n");

    return `${rolePrompt}\n\nConversation History:\n${historyPrompt}\n\nCandidate: ${userMessage}\n\nInterviewer:`;
  }

  // Prepare prompt for question generation
  prepareQuestionPrompt(context) {
    return `Generate 5 technical interview questions for a ${
      context.position
    } position at ${context.company}.
    Required skills: ${context.skills.join(", ")}.
    Include questions about:
    1. Technical knowledge
    2. Problem-solving abilities
    3. Past experience
    4. System design
    5. Code implementation
    
    Format each question with:
    - Question text
    - Expected answer points
    - Difficulty level (junior/mid/senior)`;
  }

  // Prepare prompt for response evaluation
  prepareEvaluationPrompt(context, questions, answers) {
    return `Evaluate the following interview responses for a ${
      context.position
    } position at ${context.company}.
    Required skills: ${context.skills.join(", ")}.

    Questions and Answers:
    ${questions
      .map((q, i) => `Q${i + 1}: ${q}\nA${i + 1}: ${answers[i]}`)
      .join("\n\n")}

    Evaluate based on:
    1. Technical accuracy
    2. Communication clarity
    3. Problem-solving approach
    4. Experience relevance
    5. Overall fit for the role`;
  }

  // Parse generated questions
  parseQuestions(response) {
    // Split response into individual questions
    const questions = response.split(/\n\n/).filter((q) => q.trim());

    return questions.map((q) => {
      const lines = q.split("\n");
      return {
        question: lines[0].replace(/^\d+\.\s*/, ""),
        expectedPoints: lines.slice(1, -1).map((l) => l.replace(/^-\s*/, "")),
        difficulty:
          lines[lines.length - 1].match(/junior|mid|senior/i)?.[0] || "mid",
      };
    });
  }

  // Parse evaluation results
  parseEvaluation(response) {
    const sections = response.split(/\n\n/);
    return {
      technicalScore: this.extractScore(sections[0]),
      communicationScore: this.extractScore(sections[1]),
      problemSolvingScore: this.extractScore(sections[2]),
      experienceScore: this.extractScore(sections[3]),
      overallScore: this.extractScore(sections[4]),
      feedback: sections.slice(5).join("\n"),
    };
  }

  // Helper to extract scores from text
  extractScore(text) {
    const match = text.match(/(\d+)\/100/);
    return match ? parseInt(match[1]) : 0;
  }
}

module.exports = new GeminiService();
