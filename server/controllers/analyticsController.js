const analyticsService = require("../services/analyticsService");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

class AnalyticsController {
  // Get call analytics
  async getCallAnalytics(req, res) {
    try {
      const { callId } = req.params;
      const userId = req.user.uid;

      // Verify call ownership
      const call = await prisma.interaction.findFirst({
        where: {
          id: callId,
          userId,
        },
      });

      if (!call) {
        return res.status(404).json({
          success: false,
          error: "Call not found",
        });
      }

      // Get analytics
      const analytics = await analyticsService.getCallAnalytics(callId);

      res.json({
        success: true,
        data: analytics,
      });
    } catch (error) {
      console.error("Get Call Analytics Error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to get call analytics",
      });
    }
  }

  // Get user analytics
  async getUserAnalytics(req, res) {
    try {
      const userId = req.user.uid;
      const { timeRange } = req.query;

      // Get analytics
      const analytics = await analyticsService.getUserAnalytics(
        userId,
        timeRange
      );

      res.json({
        success: true,
        data: analytics,
      });
    } catch (error) {
      console.error("Get User Analytics Error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to get user analytics",
      });
    }
  }

  // Get system analytics (admin only)
  async getSystemAnalytics(req, res) {
    try {
      const { timeRange } = req.query;

      // Verify admin role
      if (req.user.role !== "ADMIN") {
        return res.status(403).json({
          success: false,
          error: "Admin access required",
        });
      }

      // Get analytics
      const analytics = await analyticsService.getSystemAnalytics(timeRange);

      res.json({
        success: true,
        data: analytics,
      });
    } catch (error) {
      console.error("Get System Analytics Error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to get system analytics",
      });
    }
  }

  // Track call metrics
  async trackCallMetrics(req, res) {
    try {
      const { callId } = req.params;
      const { metrics } = req.body;
      const userId = req.user.uid;

      // Verify call ownership
      const call = await prisma.interaction.findFirst({
        where: {
          id: callId,
          userId,
        },
      });

      if (!call) {
        return res.status(404).json({
          success: false,
          error: "Call not found",
        });
      }

      // Track metrics
      const result = await analyticsService.trackCallMetrics(callId, metrics);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error("Track Call Metrics Error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to track call metrics",
      });
    }
  }

  // Record call
  async recordCall(req, res) {
    try {
      const { callId } = req.params;
      const userId = req.user.uid;

      // Verify call ownership
      const call = await prisma.interaction.findFirst({
        where: {
          id: callId,
          userId,
        },
      });

      if (!call) {
        return res.status(404).json({
          success: false,
          error: "Call not found",
        });
      }

      // Record call
      const result = await analyticsService.recordCall(callId, req);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error("Record Call Error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to record call",
      });
    }
  }
}

module.exports = new AnalyticsController();
