const express = require("express");
const router = express.Router();
const interviewController = require("../controllers/interviewController");
const authMiddleware = require("../middleware/authMiddleware");
const prisma = require("../prisma");

// Start a new interview
router.post(
  "/",
  authMiddleware.verifyToken,
  authMiddleware.checkRole(["ADMIN", "RECRUITER"]),
  interviewController.startInterview
);

// Submit answer for a question
router.post(
  "/:interviewId/answers",
  authMiddleware.verifyToken,
  authMiddleware.checkRole(["ADMIN", "RECRUITER"]),
  interviewController.submitAnswer
);

// Evaluate interview
router.post(
  "/:interviewId/evaluate",
  authMiddleware.verifyToken,
  authMiddleware.checkRole(["ADMIN", "RECRUITER"]),
  interviewController.evaluateInterview
);

// Get interview status
router.get(
  "/:interviewId/status",
  authMiddleware.verifyToken,
  authMiddleware.checkRole(["ADMIN", "RECRUITER"]),
  interviewController.getInterviewStatus
);

// End interview
router.post(
  "/:interviewId/end",
  authMiddleware.verifyToken,
  authMiddleware.checkRole(["ADMIN", "RECRUITER"]),
  interviewController.endInterview
);

// Get all interviews
router.get("/", authMiddleware.verifyToken, async (req, res) => {
  try {
    const interviews = await prisma.interviewReport.findMany({
      where: { userId: req.user.uid },
      include: {
        interaction: true,
      },
    });

    res.json({ success: true, data: interviews });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, error: "Failed to fetch interviews" });
  }
});

// Get interview by ID
router.get("/:id", authMiddleware.verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const interview = await prisma.interviewReport.findUnique({
      where: {
        id,
        userId: req.user.uid,
      },
      include: {
        interaction: true,
      },
    });

    if (!interview) {
      return res
        .status(404)
        .json({ success: false, error: "Interview not found" });
    }

    res.json({ success: true, data: interview });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, error: "Failed to fetch interview" });
  }
});

// Create interview
router.post("/", authMiddleware.verifyToken, async (req, res) => {
  try {
    const { candidateId, questions, answers, evaluation } = req.body;
    const interview = await prisma.interviewReport.create({
      data: {
        candidateId,
        questions,
        answers,
        evaluation,
        userId: req.user.uid,
      },
    });

    res.json({ success: true, data: interview });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, error: "Failed to create interview" });
  }
});

// Update interview
router.put("/:id", authMiddleware.verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { questions, answers, evaluation } = req.body;

    const interview = await prisma.interviewReport.update({
      where: {
        id,
        userId: req.user.uid,
      },
      data: { questions, answers, evaluation },
    });

    res.json({ success: true, data: interview });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, error: "Failed to update interview" });
  }
});

// Delete interview
router.delete("/:id", authMiddleware.verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.interviewReport.delete({
      where: {
        id,
        userId: req.user.uid,
      },
    });

    res.json({ success: true, message: "Interview deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, error: "Failed to delete interview" });
  }
});

module.exports = router;
