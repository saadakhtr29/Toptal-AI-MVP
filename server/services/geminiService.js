const { GoogleGenerativeAI } = require("@google/generative-ai");
const conversationMemory = require("../utils/conversationMemory");

class GeminiService {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-pro" });
    this.chat = this.model.startChat({
      history: [],
      generationConfig: {
        maxOutputTokens: 1000,
        temperature: 0.7,
      },
    });
  }

  // Generate AI response
  async generateResponse(prompt, context = {}) {
    try {
      const result = await this.chat.sendMessage(prompt);
      const response = await result.response;
      return {
        text: response.text(),
        context: this.chat.history,
      };
    } catch (error) {
      console.error("Gemini API Error:", error);
      throw new Error("Failed to generate AI response");
    }
  }

  // Generate interview questions
  async generateInterviewQuestions(role) {
    try {
      const prompt = `Generate 5-7 technical interview questions for a ${role} position. 
        Format the response as a JSON array with questions and expected answers.`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return JSON.parse(response.text());
    } catch (error) {
      console.error("Interview Questions Generation Error:", error);
      throw new Error("Failed to generate interview questions");
    }
  }

  // Evaluate interview answers
  async evaluateAnswers(questions, answers) {
    try {
      const prompt = `Evaluate these interview answers for the following questions:
        Questions: ${JSON.stringify(questions)}
        Answers: ${JSON.stringify(answers)}
        Provide a score out of 10 and a detailed feedback.`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return JSON.parse(response.text());
    } catch (error) {
      console.error("Answer Evaluation Error:", error);
      throw new Error("Failed to evaluate answers");
    }
  }

  // Generate outreach message
  async generateOutreachMessage(candidateProfile, jobDescription) {
    try {
      const prompt = `Generate a personalized outreach message for this candidate:
        Profile: ${JSON.stringify(candidateProfile)}
        Job Description: ${jobDescription}
        Make it professional and engaging.`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error("Outreach Message Generation Error:", error);
      throw new Error("Failed to generate outreach message");
    }
  }
}

module.exports = new GeminiService();
