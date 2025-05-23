const interviewService = require("../services/interviewService");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

class InterviewController {
  // Start a new interview
  async startInterview(req, res) {
    try {
      const { role, context } = req.body;
      const userId = req.user.uid;

      // Create interview record in database
      const interview = await prisma.interviewReport.create({
        data: {
          userId,
          role,
          status: "in-progress",
          context: context || {},
        },
      });

      // Start interview session
      const session = await interviewService.startInterview(role, {
        ...context,
        interviewId: interview.id,
      });

      res.json({
        success: true,
        data: {
          interviewId: interview.id,
          ...session,
        },
      });
    } catch (error) {
      console.error("Start Interview Error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to start interview",
      });
    }
  }

  // Submit answer
  async submitAnswer(req, res) {
    try {
      const { interviewId } = req.params;
      const { questionIndex, answer } = req.body;
      const userId = req.user.uid;

      // Verify interview ownership
      const interview = await prisma.interviewReport.findFirst({
        where: {
          id: interviewId,
          userId,
        },
      });

      if (!interview) {
        return res.status(404).json({
          success: false,
          error: "Interview not found",
        });
      }

      // Submit answer
      const result = await interviewService.submitAnswer(
        interview.sessionId,
        questionIndex,
        answer
      );

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error("Submit Answer Error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to submit answer",
      });
    }
  }

  // Evaluate interview
  async evaluateInterview(req, res) {
    try {
      const { interviewId } = req.params;
      const userId = req.user.uid;

      // Verify interview ownership
      const interview = await prisma.interviewReport.findFirst({
        where: {
          id: interviewId,
          userId,
        },
      });

      if (!interview) {
        return res.status(404).json({
          success: false,
          error: "Interview not found",
        });
      }

      // Evaluate interview
      const evaluation = await interviewService.evaluateInterview(
        interview.sessionId
      );

      // Update interview record
      await prisma.interviewReport.update({
        where: {
          id: interviewId,
        },
        data: {
          status: "completed",
          evaluation: evaluation.evaluation,
          report: evaluation.report,
          completedAt: new Date(),
        },
      });

      res.json({
        success: true,
        data: evaluation,
      });
    } catch (error) {
      console.error("Evaluate Interview Error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to evaluate interview",
      });
    }
  }

  // Get interview status
  async getInterviewStatus(req, res) {
    try {
      const { interviewId } = req.params;
      const userId = req.user.uid;

      // Verify interview ownership
      const interview = await prisma.interviewReport.findFirst({
        where: {
          id: interviewId,
          userId,
        },
      });

      if (!interview) {
        return res.status(404).json({
          success: false,
          error: "Interview not found",
        });
      }

      // Get status
      const status = interviewService.getInterviewStatus(interview.sessionId);

      res.json({
        success: true,
        data: {
          interviewId: interview.id,
          ...status,
        },
      });
    } catch (error) {
      console.error("Get Status Error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to get interview status",
      });
    }
  }

  // End interview
  async endInterview(req, res) {
    try {
      const { interviewId } = req.params;
      const userId = req.user.uid;

      // Verify interview ownership
      const interview = await prisma.interviewReport.findFirst({
        where: {
          id: interviewId,
          userId,
        },
      });

      if (!interview) {
        return res.status(404).json({
          success: false,
          error: "Interview not found",
        });
      }

      // End interview
      const result = await interviewService.endInterview(interview.sessionId);

      // Update interview record
      await prisma.interviewReport.update({
        where: {
          id: interviewId,
        },
        data: {
          status: "ended",
          endedAt: new Date(),
        },
      });

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error("End Interview Error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to end interview",
      });
    }
  }
}

module.exports = new InterviewController();
