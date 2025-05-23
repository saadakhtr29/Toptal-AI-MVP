const geminiService = require("./geminiService");
const conversationMemory = require("../utils/conversationMemory");
const { v4: uuidv4 } = require("uuid");

class InterviewService {
  constructor() {
    this.activeInterviews = new Map();
  }

  // Start a new interview session
  async startInterview(role, context = {}) {
    try {
      const sessionId = uuidv4();

      // Initialize conversation memory
      conversationMemory.initializeConversation(sessionId, {
        role: "interviewer",
        position: role,
        ...context,
      });

      // Generate interview questions
      const questions = await geminiService.generateQuestions({
        position: role,
        ...context,
      });

      // Store interview session
      this.activeInterviews.set(sessionId, {
        sessionId,
        role,
        questions,
        answers: [],
        startTime: Date.now(),
        status: "in-progress",
        context,
      });

      return {
        sessionId,
        questions,
        context,
      };
    } catch (error) {
      console.error("Interview Start Error:", error);
      throw new Error("Failed to start interview");
    }
  }

  // Submit answer for a question
  async submitAnswer(sessionId, questionIndex, answer) {
    try {
      const interview = this.activeInterviews.get(sessionId);
      if (!interview) {
        throw new Error("Interview session not found");
      }

      // Add answer to conversation memory
      conversationMemory.addMessage(sessionId, {
        role: "candidate",
        content: answer,
        timestamp: Date.now(),
      });

      // Store answer
      interview.answers[questionIndex] = {
        question: interview.questions[questionIndex],
        answer,
        timestamp: Date.now(),
      };

      return {
        sessionId,
        questionIndex,
        status: "answered",
      };
    } catch (error) {
      console.error("Answer Submission Error:", error);
      throw new Error("Failed to submit answer");
    }
  }

  // Evaluate interview
  async evaluateInterview(sessionId) {
    try {
      const interview = this.activeInterviews.get(sessionId);
      if (!interview) {
        throw new Error("Interview session not found");
      }

      // Get conversation history
      const history = conversationMemory.getHistory(sessionId);
      const context = conversationMemory.getContext(sessionId);

      // Evaluate responses
      const evaluation = await geminiService.evaluateResponses(
        context,
        interview.questions,
        interview.answers.map((a) => a.answer)
      );

      // Generate PDF report
      const report = await this.generateReport(sessionId, evaluation);

      // Update interview status
      interview.status = "completed";
      interview.evaluation = evaluation;
      interview.report = report;
      interview.endTime = Date.now();

      return {
        sessionId,
        evaluation,
        report,
        duration: interview.endTime - interview.startTime,
      };
    } catch (error) {
      console.error("Interview Evaluation Error:", error);
      throw new Error("Failed to evaluate interview");
    }
  }

  // Generate PDF report
  async generateReport(sessionId, evaluation) {
    try {
      const interview = this.activeInterviews.get(sessionId);
      if (!interview) {
        throw new Error("Interview session not found");
      }

      const report = {
        sessionId,
        role: interview.role,
        startTime: interview.startTime,
        endTime: Date.now(),
        duration: Date.now() - interview.startTime,
        questions: interview.questions,
        answers: interview.answers,
        evaluation,
        context: interview.context,
      };

      // Here you would typically generate a PDF using a library like html2pdf
      // For now, we'll return the report object
      return report;
    } catch (error) {
      console.error("Report Generation Error:", error);
      throw new Error("Failed to generate report");
    }
  }

  // Get interview status
  getInterviewStatus(sessionId) {
    const interview = this.activeInterviews.get(sessionId);
    if (!interview) {
      return null;
    }

    return {
      sessionId: interview.sessionId,
      role: interview.role,
      status: interview.status,
      startTime: interview.startTime,
      duration: Date.now() - interview.startTime,
      questionsAnswered: interview.answers.length,
      totalQuestions: interview.questions.length,
    };
  }

  // End interview session
  async endInterview(sessionId) {
    try {
      const interview = this.activeInterviews.get(sessionId);
      if (!interview) {
        throw new Error("Interview session not found");
      }

      // End conversation
      const summary = await conversationMemory.endConversation(sessionId);

      // Clean up interview
      interview.status = "ended";
      interview.endTime = Date.now();
      this.activeInterviews.delete(sessionId);

      return {
        sessionId,
        summary,
        duration: interview.endTime - interview.startTime,
      };
    } catch (error) {
      console.error("Interview End Error:", error);
      throw new Error("Failed to end interview");
    }
  }
}

// Export a singleton instance
module.exports = new InterviewService();
